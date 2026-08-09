import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import { grDerivedTokens, grFoundationTokens, grThemeTokens } from '../tokens'

// В jsdom `import.meta.url` не file-scheme — пути от cwd пакета, как в `cssContrast.ts`.
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
 * выглядит групповая ссылка из комментария (`--gr-tree-*`), а не токен.
 */
function tokenNamesIn(source: string): Set<string> {
  return new Set(
    [...source.matchAll(/--gr-[a-z0-9-]+/g)]
      .map(match => match[0])
      .filter(name => !name.endsWith('-')),
  )
}

function readRegistries(): Registry[] {
  const entries: { owner: string, path: string, sourceDir: string }[] = readdirSync(componentsDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && entry.name.startsWith('Gr'))
    .map(entry => ({
      owner: entry.name,
      path: `src/components/${entry.name}/tokens.json`,
      sourceDir: resolve(componentsDir, entry.name),
    }))
    .concat([{ owner: 'composables', path: 'src/composables/tokens.json', sourceDir: resolve(srcDir, 'composables') }])
    .filter(entry => existsSync(resolve(process.cwd(), entry.path)))

  return entries.map(entry => ({
    ...entry,
    tokens: JSON.parse(readFileSync(resolve(process.cwd(), entry.path), 'utf8')).tokens as RegisteredToken[],
  }))
}

const registries = readRegistries()
const registered = new Map(registries.flatMap(registry => registry.tokens.map(token => [token.name, registry])))

const globalTokens = new Set([
  ...grFoundationTokens.map(token => token.name),
  ...grDerivedTokens.map(token => token.name),
  ...grThemeTokens.map(token => token.name),
])

/**
 * Гейт покомпонентного контракта тем.
 *
 * Покомпонентные переменные (`--gr-tree-row-py`, `--gr-button-primary-bg`)
 * потребитель видит как публичный API темизации: он их переопределяет. Пакет же
 * до реестра не видел их вовсе — переименование не роняло ни одного теста, а
 * узнать имя можно было только из исходников. Реестр `tokens.json` рядом с
 * компонентом закрывает обе дыры: имя объявлено, и оно попадает в
 * `docs/tokens.md` вместе с природой (`kind`) и дефолтом.
 *
 * CSS из реестра не генерируется намеренно: `hook`-токены обязаны остаться
 * неприсвоенными, иначе `var(--gr-x, дефолт)` перестанет падать на дефолт.
 */
describe('покомпонентные токены (docs/tokens.md)', () => {
  it('каждая переменная в исходниках объявлена — глобально или в реестре компонента', () => {
    const unknown = readSources(srcDir)
      .filter(({ path }) => !path.startsWith('styles/') && !path.startsWith('tokens/'))
      .flatMap(({ path, source }) => [...tokenNamesIn(source)]
        .filter(name => !globalTokens.has(name) && !registered.has(name))
        .map(name => `${name} (${path})`))

    expect(
      [...new Set(unknown)].sort(),
      'заведи токен в `tokens/*.json` или зарегистрируй в `tokens.json` компонента',
    ).toEqual([])
  })

  it('реестр не протух: зарегистрированное встречается в исходниках владельца', () => {
    const stale = registries.flatMap((registry) => {
      const used = new Set(readSources(registry.sourceDir).flatMap(({ source }) => [...tokenNamesIn(source)]))

      return registry.tokens.filter(token => !used.has(token.name)).map(token => `${token.name} (${registry.path})`)
    })

    expect(stale, 'токен больше не используется — убери его из реестра').toEqual([])
  })

  it('реестр не переопределяет глобальные роли и примитивы', () => {
    const shadowed = [...registered.keys()].filter(name => globalTokens.has(name))

    expect(shadowed, 'имя занято ролью темы или примитивом из `tokens/*.json`').toEqual([])
  })

  it('токены покомпонентных тем зарегистрированы как `theme`', () => {
    const wrong = registries.flatMap((registry) => {
      const themesDir = resolve(registry.sourceDir, 'themes')
      if (!existsSync(themesDir))
        return []

      const declared = readSources(themesDir).flatMap(({ source }) =>
        [...source.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/(--gr-[a-z0-9-]+)\s*:/g)].map(match => match[1]))

      return [...new Set(declared)]
        .filter(name => registered.get(name)?.owner !== registry.owner || registered.get(name)?.tokens.find(token => token.name === name)?.kind !== 'theme')
        .map(name => `${name} (${registry.path})`)
    })

    expect(wrong, 'объявлен в `themes/*.css` — значит `kind: "theme"` у своего компонента').toEqual([])
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
})
