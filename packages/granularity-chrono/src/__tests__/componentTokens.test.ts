import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import { grComponentTokens, grDerivedTokens, grFoundationTokens, grThemeTokens } from '@feugene/granularity/tokens'

/**
 * Гейт покомпонентного контракта тем — копия того, что живёт в ядре
 * (`packages/granularity/src/__tests__/componentTokens.test.ts`).
 *
 * Покомпонентные переменные (`--gr-calendar-selected-bg`) потребитель видит как
 * публичный API темизации: он их переопределяет. Без реестра пакет не видит их
 * вовсе — переименование не роняет ни одного теста, а узнать имя можно только
 * из исходников.
 *
 * Отличие от ядра одно и важное: **чужие токены здесь легальны как
 * употребление, но не как объявление**. Роли `--gr-fg`, `--gr-ring` и
 * покомпонентные хуки ядра приезжают из его реестров; свои объявляются в
 * `tokens.json` рядом с компонентом. Опечатка в чужом имени — самая дешёвая
 * ошибка из возможных (`var(--gr-destructive)` в предшественнике не красил
 * ничего и молчал), и ловится она именно здесь.
 */

const srcDir = resolve(process.cwd(), 'src')
const componentsDir = resolve(srcDir, 'components')

const KINDS = new Set(['theme', 'css', 'inline', 'hook'])

interface RegisteredToken {
  name: string
  kind: string
  default: string
  description: string
}

interface Registry {
  owner: string
  path: string
  /** Директория, исходники которой считаются употреблением токена. */
  sourceDir: string
  tokens: RegisteredToken[]
}

function readSources(dir: string): { path: string, source: string }[] {
  if (!existsSync(dir))
    return []

  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = resolve(dir, entry.name)

    if (entry.isDirectory())
      return entry.name === '__tests__' ? [] : readSources(full)

    if (!/\.(?:vue|ts|css)$/.test(entry.name) || entry.name.includes('.test.'))
      return []

    return [{ path: full.slice(srcDir.length + 1), source: readFileSync(full, 'utf8') }]
  })
}

/**
 * Имена токенов в тексте. Хвостовой дефис отбрасывается вместе с именем: так
 * выглядит групповая ссылка из комментария (`--gr-calendar-*`), а не токен.
 */
function tokenNamesIn(source: string): Set<string> {
  return new Set(
    [...source.matchAll(/--gr-[a-z0-9-]+/g)]
      .map(match => match[0])
      .filter(name => !name.endsWith('-')),
  )
}

function readRegistries(): Registry[] {
  return readdirSync(componentsDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && entry.name.startsWith('Gr'))
    .map(entry => ({
      owner: entry.name,
      path: `src/components/${entry.name}/tokens.json`,
      sourceDir: resolve(componentsDir, entry.name),
    }))
    .filter(entry => existsSync(resolve(process.cwd(), entry.path)))
    .map((entry) => {
      const parsed = JSON.parse(readFileSync(resolve(process.cwd(), entry.path), 'utf8')) as { tokens: RegisteredToken[] }

      return { ...entry, tokens: parsed.tokens }
    })
}

const registries = readRegistries()
const registered = new Map(registries.flatMap(registry => registry.tokens.map(token => [token.name, registry])))

/** Всё, что объявляет ядро: роли темы, примитивы, производные и его покомпонентные хуки. */
const coreTokens = new Set([
  ...grFoundationTokens.map(token => token.name),
  ...grDerivedTokens.map(token => token.name),
  ...grThemeTokens.map(token => token.name),
  ...grComponentTokens.map(token => token.name),
])

describe('покомпонентные токены', () => {
  it('каждая переменная в исходниках объявлена — ядром или реестром компонента', () => {
    const unknown = readSources(srcDir)
      .flatMap(({ path, source }) => [...tokenNamesIn(source)]
        .filter(name => !coreTokens.has(name) && !registered.has(name))
        .map(name => `${name} (${path})`))

    expect(
      [...new Set(unknown)].sort(),
      'опечатка в имени роли ядра либо незарегистрированный свой токен — заведи его в `tokens.json` компонента',
    ).toEqual([])
  })

  it('реестр не протух: зарегистрированное встречается в исходниках владельца', () => {
    const stale = registries.flatMap((registry) => {
      const used = new Set(readSources(registry.sourceDir).flatMap(({ source }) => [...tokenNamesIn(source)]))

      return registry.tokens.filter(token => !used.has(token.name)).map(token => `${token.name} (${registry.path})`)
    })

    expect(stale, 'токен больше не используется — убери его из реестра').toEqual([])
  })

  it('реестр не переопределяет то, что объявило ядро', () => {
    const shadowed = [...registered.keys()].filter(name => coreTokens.has(name))

    expect(shadowed, 'имя занято ролью, примитивом или хуком компонента ядра').toEqual([])
  })

  it('имя своего токена начинается с имени владельца', () => {
    // Иначе хук `GrDatePicker` мог бы называться `--gr-calendar-*` и
    // переопределяться темой не там, где ожидает потребитель.
    const misnamed = registries.flatMap((registry) => {
      const prefix = `--gr-${registry.owner.replace(/^Gr/, '').replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}-`

      return registry.tokens.filter(token => !token.name.startsWith(prefix))
        .map(token => `${token.name} (ожидался префикс ${prefix})`)
    })

    expect(misnamed).toEqual([])
  })

  it('записи реестра заполнены полностью', () => {
    const broken = registries.flatMap(registry => registry.tokens
      .filter(token => !/^--gr-[a-z0-9-]+$/.test(token.name ?? '')
        || !KINDS.has(token.kind)
        || !token.default?.trim()
        || !token.description?.trim())
      .map(token => `${token.name ?? '<без имени>'} (${registry.path})`))

    expect(broken, `обязательны name, kind (${[...KINDS].join('|')}), default, description`).toEqual([])
  })

  it('в пакете есть компоненты со своими токенами', () => {
    // Гейт на пустом списке зелен всегда.
    expect(registries.length).toBeGreaterThan(0)
  })
})
