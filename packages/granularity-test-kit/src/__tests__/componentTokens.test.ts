import { resolve } from 'node:path'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { readSources } from '../sources'
import {
  collectBrokenEntries,
  collectMisnamedTokens,
  collectStaleTokens,
  collectUnknownTokens,
  collectWrongThemeKind,
  ownerPrefix,
  readTokenRegistries,
  type TokenRegistry,
} from '../gates/componentTokens'
import { createFixturePackage } from './fixture'

function registryOf(registries: TokenRegistry[], owner: string): TokenRegistry {
  const registry = registries.find(item => item.owner === owner)
  if (!registry)
    throw new Error(`нет реестра ${owner}`)

  return registry
}

const thingTokens = {
  tokens: [
    { name: '--gr-thing-bg', kind: 'theme', default: 'var(--gr-bg)', description: 'фон' },
    { name: '--gr-thing-gap', kind: 'hook', default: '4px', description: 'зазор' },
  ],
}

let dir: string
let srcDir: string
let cleanup: () => void
let registries: TokenRegistry[]

beforeAll(() => {
  ({ dir, cleanup } = createFixturePackage({
    'src/components/GrThing/GrThing.vue': '<template><div :style="{ gap: \'var(--gr-thing-gap)\' }" /></template>',
    'src/components/GrThing/styles.css': '.gr-thing { background: var(--gr-thing-bg); color: var(--gr-fg); }',
    'src/components/GrThing/themes/soft.css': ':root { --gr-thing-bg: #fff; }',
    'src/components/GrThing/tokens.json': JSON.stringify(thingTokens),
    'src/components/GrOther/GrOther.vue': '<template><div class="gr-other" /></template>',
    'src/composables/tokens.json': JSON.stringify({
      tokens: [{ name: '--gr-overlay-z', kind: 'css', default: '1000', description: 'слой' }],
    }),
    'src/composables/useOverlay.ts': 'export const z = \'var(--gr-overlay-z)\'',
  }))

  srcDir = resolve(dir, 'src')
  registries = readTokenRegistries(srcDir, ['composables'])
})

afterAll(() => cleanup())

describe('readTokenRegistries', () => {
  it('берёт реестры компонентов и объявленные отдельно', () => {
    expect(registries.map(registry => registry.owner).sort()).toEqual(['GrThing', 'composables'])
  })

  it('компонент без `tokens.json` реестра не заводит', () => {
    expect(registries.some(registry => registry.owner === 'GrOther')).toBe(false)
  })

  it('префикс владельца требуется от компонента, но не от отдельного реестра', () => {
    expect(registryOf(registries, 'GrThing').prefixed).toBe(true)
    expect(registryOf(registries, 'composables').prefixed).toBe(false)
  })
})

describe('collectUnknownTokens', () => {
  const registered = () => new Map(registries.flatMap(registry => registry.tokens.map(token => [token.name, registry] as const)))

  it('молчит, когда каждая переменная объявлена глобально или реестром', () => {
    const sources = readSources({ dir: srcDir })

    expect(collectUnknownTokens(sources, new Set(['--gr-fg']), registered())).toEqual([])
  })

  it('ловит опечатку в чужом имени и называет файл', () => {
    const sources = [{ path: 'components/GrThing/GrThing.vue', source: 'color: var(--gr-destructive)' }]

    expect(collectUnknownTokens(sources, new Set(['--gr-fg']), registered()))
      .toEqual(['--gr-destructive (components/GrThing/GrThing.vue)'])
  })
})

describe('collectStaleTokens', () => {
  it('молчит, пока токен встречается в исходниках владельца', () => {
    expect(collectStaleTokens(registries)).toEqual([])
  })

  it('ловит запись, которой в исходниках владельца больше нет', () => {
    const stale: TokenRegistry = {
      ...registryOf(registries, 'GrThing'),
      tokens: [{ name: '--gr-thing-removed', kind: 'hook', default: '0', description: 'ушёл' }],
    }

    expect(collectStaleTokens([stale])).toEqual(['--gr-thing-removed (src/components/GrThing/tokens.json)'])
  })
})

describe('collectWrongThemeKind', () => {
  it('молчит, когда переменная из `themes/*.css` записана как `theme`', () => {
    const registered = new Map(registries.flatMap(registry => registry.tokens.map(token => [token.name, registry] as const)))

    expect(collectWrongThemeKind(registries, registered)).toEqual([])
  })

  it('ловит переменную темы, записанную другим `kind`', () => {
    const registry: TokenRegistry = {
      ...registryOf(registries, 'GrThing'),
      tokens: [{ name: '--gr-thing-bg', kind: 'hook', default: '#fff', description: 'фон' }],
    }
    const registered = new Map(registry.tokens.map(token => [token.name, registry] as const))

    expect(collectWrongThemeKind([registry], registered)).toEqual(['--gr-thing-bg (src/components/GrThing/tokens.json)'])
  })
})

describe('collectMisnamedTokens', () => {
  it('молчит на префиксе владельца и не трогает отдельные реестры', () => {
    expect(collectMisnamedTokens(registries)).toEqual([])
  })

  it('ловит чужой префикс у компонента', () => {
    const registry: TokenRegistry = {
      ...registryOf(registries, 'GrThing'),
      tokens: [{ name: '--gr-calendar-bg', kind: 'theme', default: '#fff', description: 'фон' }],
    }

    expect(collectMisnamedTokens([registry])).toEqual(['--gr-calendar-bg (ожидался префикс --gr-thing-)'])
  })

  it('уважает объявленное сокращение семейства', () => {
    // `GrProgressBar` держит `--gr-progress-*`: имя токена — публичный контракт
    // темы, и переименование ради буквальности стоило бы мажорной версии.
    const registry: TokenRegistry = {
      ...registryOf(registries, 'GrThing'),
      owner: 'GrThingBar',
      tokens: [{ name: '--gr-thing-bg', kind: 'theme', default: '#fff', description: 'фон' }],
    }

    expect(collectMisnamedTokens([registry])).toHaveLength(1)
    expect(collectMisnamedTokens([registry], { GrThingBar: '--gr-thing-' })).toEqual([])
  })
})

describe('collectBrokenEntries', () => {
  it('молчит на заполненных записях', () => {
    expect(collectBrokenEntries(registries)).toEqual([])
  })

  it.each([
    ['имя не по канону', { name: '--thing-bg', kind: 'theme', default: '#fff', description: 'фон' }],
    ['неизвестный kind', { name: '--gr-thing-bg', kind: 'magic', default: '#fff', description: 'фон' }],
    ['пустой default', { name: '--gr-thing-bg', kind: 'theme', default: '  ', description: 'фон' }],
    ['пустое описание', { name: '--gr-thing-bg', kind: 'theme', default: '#fff', description: '' }],
  ])('ловит запись: %s', (_case, token) => {
    const registry: TokenRegistry = { ...registryOf(registries, 'GrThing'), tokens: [token] }

    expect(collectBrokenEntries([registry])).toHaveLength(1)
  })
})

describe('ownerPrefix', () => {
  it.each([
    ['GrThing', '--gr-thing-'],
    ['GrDatePicker', '--gr-date-picker-'],
    ['GrChartLine', '--gr-chart-line-'],
  ])('%s → %s', (owner, prefix) => {
    expect(ownerPrefix(owner)).toBe(prefix)
  })
})
