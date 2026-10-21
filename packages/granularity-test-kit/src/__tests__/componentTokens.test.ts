import { resolve } from 'node:path'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { readSources } from '../sources'
import {
  collectBrokenEntries,
  collectHookLiterals,
  collectMisnamedTokens,
  collectSectionKindIssues,
  collectStaleLiteralReasons,
  collectStaleTokens,
  collectThemesDirUsage,
  collectThemeTokenFallbacks,
  collectTokenReads,
  collectUnknownTokens,
  collectWrongThemeKind,
  ownerPrefix,
  readComponentThemeSources,
  readThemeSections,
  readThemeSources,
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
    'src/components/GrThing/themes/slate/root.json': JSON.stringify({ 'gr-thing-bg': 'var(--gr-bg)' }),
    'src/components/GrThing/themes/slate/modes/dark.json': JSON.stringify({ 'gr-thing-bg': '#000' }),
    'src/components/GrThing/themes/slate/modes/light.css': '.x { --gr-thing-bg: #fff; }',
    'src/components/GrThing/themes/README.md': '--gr-thing-ignored: 1;',
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

  it('видит ссылку из значения в JSON темы компонента', () => {
    expect(collectUnknownTokens(readComponentThemeSources(srcDir), new Set(['--gr-fg']), registered()))
      .toEqual(['--gr-bg (components/GrThing/themes/slate/root.json)'])
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

describe('readThemeSources', () => {
  it('JSON и CSS темы по раскладке `themesDir`, JSON — строками объявлений; README мимо', () => {
    const sources = readThemeSources(resolve(srcDir, 'components/GrThing/themes'))

    expect(sources.map(source => source.path)).toEqual(['slate/modes/dark.json', 'slate/modes/light.css', 'slate/root.json'])
    expect(sources.find(source => source.path === 'slate/root.json')?.source).toBe('--gr-thing-bg: var(--gr-bg);')
  })

  it('темы пакета — с путём от `src`', () => {
    expect(readComponentThemeSources(srcDir).map(source => source.path)).toContain('components/GrThing/themes/slate/modes/dark.json')
  })
})

describe('collectWrongThemeKind', () => {
  it('молчит, когда переменная из `themes/<тема>/` записана как `theme`', () => {
    const registered = new Map(registries.flatMap(registry => registry.tokens.map(token => [token.name, registry] as const)))

    expect(collectWrongThemeKind(registries, registered)).toEqual([])
  })

  it('хук в папке тем компонента допускается, пока не включён themeKindOnly', () => {
    const registry: TokenRegistry = {
      ...registryOf(registries, 'GrThing'),
      tokens: [{ name: '--gr-thing-bg', kind: 'hook', default: '#fff', description: 'фон' }],
    }
    const registered = new Map(registry.tokens.map(token => [token.name, registry] as const))

    expect(collectWrongThemeKind([registry], registered)).toEqual([])
    expect(collectWrongThemeKind([registry], registered, ['theme'])).toEqual(['--gr-thing-bg (src/components/GrThing/tokens.json)'])
  })

  it('ловит переменную темы, записанную другим `kind`', () => {
    const registry: TokenRegistry = {
      ...registryOf(registries, 'GrThing'),
      tokens: [{ name: '--gr-thing-bg', kind: 'inline', default: '#fff', description: 'фон' }],
    }
    const registered = new Map(registry.tokens.map(token => [token.name, registry] as const))

    expect(collectWrongThemeKind([registry], registered)).toEqual(['--gr-thing-bg (src/components/GrThing/tokens.json)'])
  })

  it('ловит лишний токен в файле режима', () => {
    const { dir: extraDir, cleanup: drop } = createFixturePackage({
      'src/components/GrThing/tokens.json': JSON.stringify(thingTokens),
      'src/components/GrThing/themes/slate/modes/dark.json': JSON.stringify({ 'gr-thing-bg': '#000', 'gr-thing-extra': '#111' }),
    })
    try {
      const extra = readTokenRegistries(resolve(extraDir, 'src'))
      const registered = new Map(extra.flatMap(registry => registry.tokens.map(token => [token.name, registry] as const)))

      expect(collectWrongThemeKind(extra, registered)).toEqual(['--gr-thing-extra (src/components/GrThing/tokens.json)'])
    }
    finally {
      drop()
    }
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

describe('значения у темы: чтения токенов, литералы хуков, разделы тем', () => {
  const tokens = {
    tokens: [
      { name: '--gr-card-bg', kind: 'theme', default: 'var(--gr-bg)', description: 'фон' },
      { name: '--gr-card-z', kind: 'hook', default: '10', description: 'слой', literal: 'механика стопки' },
      { name: '--gr-card-gap', kind: 'hook', default: '4px', description: 'зазор' },
      { name: '--gr-card-ring', kind: 'hook', default: 'var(--gr-ring)', description: 'кольцо' },
      { name: '--gr-card-size', kind: 'hook', default: 'по ступени', description: 'сторона', literal: 'ступень size' },
      { name: '--gr-card-pad', kind: 'inline', default: '0px', description: 'отступ' },
    ],
  }
  let fixture: { dir: string, cleanup: () => void }
  let src: string
  let cardRegistries: TokenRegistry[]
  const registeredOf = () => new Map(cardRegistries.flatMap(registry => registry.tokens.map(token => [token.name, registry] as const)))

  beforeAll(() => {
    fixture = createFixturePackage({
      'src/components/GrCard/GrCard.vue': [
        '<template><div class="bg-[var(--gr-card-bg,var(--gr-bg))] z-[var(--gr-card-z,10)] gap-[var(--gr-card-gap,4px)]" /></template>',
        '<script setup lang="ts">',
        '// var(--gr-card-gap, 2px) — в комментарии не чтение',
        // Текст исходника фикстуры: подстановка шаблона — его часть, а не наша.
        // eslint-disable-next-line no-template-curly-in-string
        'const size = (step: string) => `var(--gr-card-size,${step})`',
        'const ring = \'var(--gr-card-ring,var(--gr-ring))\'',
        'const text = \'color: var(--gr-fg, #000)\'',
        'const pad = \'var(--gr-card-pad,0px)\'',
        '</script>',
      ].join('\n'),
      'src/components/GrCard/tokens.json': JSON.stringify(tokens),
      'src/components/GrCard/config.ts': 'export const c = defineComponent({ name: \'GrCard\', themesDir: \'./themes\' })',
      'src/components/GrPlain/config.ts': 'export const c = defineComponent({ name: \'GrPlain\' })',
      'src/components/GrPlain/themes/slate/root.json': '{}',
      'themes/slate/theme.json': '{}',
      'themes/slate/components/@acme/ui/GrCard/root.json': JSON.stringify({ 'gr-card-bg': '#fff', '$why': 'пояснение' }),
      'themes/slate/components/@acme/ui/GrCard/modes/dark.json': JSON.stringify({ 'gr-card-gap': '2px' }),
      'themes/slate/components/@acme/ui/GrGhost/root.json': JSON.stringify({ 'gr-ghost-x': '1px' }),
      'themes/notes/README.md': 'не тема',
    })
    src = resolve(fixture.dir, 'src')
    cardRegistries = readTokenRegistries(src)
  })

  afterAll(() => fixture.cleanup())

  it('чтения — с запасным значением, вложенные и без комментариев', () => {
    const reads = collectTokenReads(readSources({ dir: src }))
    expect(reads.map(read => `${read.token}|${read.fallback}`)).toEqual(expect.arrayContaining([
      '--gr-card-bg|var(--gr-bg)',
      '--gr-bg|null',
      // eslint-disable-next-line no-template-curly-in-string
      '--gr-card-size|${step}',
      '--gr-fg|#000',
    ]))
    expect(reads.some(read => read.fallback === '2px')).toBe(false)
  })

  it('токен темы — свой вида theme и глобальный — с фолбэком называется', () => {
    const reads = collectTokenReads(readSources({ dir: src }))
    expect(collectThemeTokenFallbacks(reads, registeredOf(), new Set(['--gr-fg', '--gr-bg']))).toEqual([
      '--gr-card-bg, var(--gr-bg) (components/GrCard/GrCard.vue)',
      '--gr-fg, #000 (components/GrCard/GrCard.vue)',
    ])
  })

  it('хук с литералом — только с причиной; ссылка на токен и значение кода причины не требуют', () => {
    const reads = collectTokenReads(readSources({ dir: src }))
    expect(collectHookLiterals(reads, registeredOf())).toEqual(['--gr-card-gap, 4px (components/GrCard/GrCard.vue)'])
  })

  it('причина у токена без литерала или не у хука — протухла', () => {
    const reads = collectTokenReads(readSources({ dir: src }))
    expect(collectStaleLiteralReasons(reads, cardRegistries)).toEqual([])
    const withExtra = cardRegistries.map(registry => ({
      ...registry,
      tokens: registry.tokens.map(token => (token.name === '--gr-card-ring' || token.name === '--gr-card-pad' ? { ...token, literal: 'лишняя' } : token)),
    }))
    expect(collectStaleLiteralReasons(reads, withExtra)).toEqual([
      '--gr-card-ring (src/components/GrCard/tokens.json)',
      '--gr-card-pad (src/components/GrCard/tokens.json)',
    ])
  })

  it('`themesDir` в config.ts и папка themes/ у компонента называются', () => {
    expect(collectThemesDirUsage(src)).toEqual([
      'src/components/GrCard/config.ts: themesDir',
      'src/components/GrPlain/themes/',
    ])
  })

  it('раздел темы: только токены вида theme своего компонента; компонент без реестра — находка', () => {
    const sections = readThemeSections({ themesDir: resolve(fixture.dir, 'themes'), packageId: '@acme/ui' })
    expect(sections.map(section => `${section.theme}/${section.owner}: ${section.tokens.join(',')}`).sort()).toEqual([
      'slate/GrCard: --gr-card-bg,--gr-card-gap',
      'slate/GrGhost: --gr-ghost-x',
    ])
    expect(collectSectionKindIssues(sections, cardRegistries)).toEqual([
      'slate: --gr-card-gap в разделе GrCard — вид hook, а тема задаёт только вид theme',
      'slate: раздел GrGhost — у пакета нет компонента с реестром токенов',
    ])
  })
})
