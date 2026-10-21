import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import { componentDirs, packageSrcDir, readSources, stripComments, tokenNamesIn, type SourceFile } from '../sources'

/** Запись реестра `tokens.json` рядом с компонентом. */
export interface RegisteredToken {
  name: string
  kind: string
  default: string
  description: string
  /** У хука с литералом по умолчанию — почему это механика компонента, а не значение темы. */
  literal?: string
}

/** Исходники тем пакета: папка тем (`<тема>/theme.json`) и id пакета в разделе `components`. */
export interface ThemeSourcesOption {
  /** Папка с исходниками тем — `<тема>/components/<packageId>/<Компонент>/`. */
  readonly themesDir: string
  readonly packageId: string
}

/** Откуда берётся значение токена, если тема его не переопределила. */
export const TOKEN_KINDS = new Set(['theme', 'css', 'inline', 'hook'])

export interface TokenRegistry {
  owner: string
  /** Путь реестра относительно корня пакета — он попадает в текст ошибки. */
  path: string
  /** Директория, исходники которой считаются употреблением токена. */
  sourceDir: string
  /** Владелец обязан именовать токены своим префиксом. */
  prefixed: boolean
  tokens: RegisteredToken[]
}

export interface ComponentTokensGateOptions {
  /** Корень исходников; по умолчанию — `<cwd>/src`. */
  srcDir?: string
  /**
   * Префикс имени компонента. По умолчанию `Gr` — обратная совместимость с
   * ядром; companion-пакету со своей приставкой этого хватает, чтобы фабрика
   * увидела его компоненты вместо нуля.
   */
  prefix?: string
  /**
   * Токены, объявленные вне покомпонентных реестров: у ядра — его собственные
   * `tokens/*.json`, у спутника — всё, что объявило ядро, включая его
   * покомпонентные хуки. Употреблять их можно, объявлять заново — нет.
   */
  globalTokens: readonly { name: string }[]
  /**
   * Реестры вне `components/` — путь директории относительно `srcDir`.
   * У ядра это `composables`, где токены не привязаны к компоненту.
   */
  extraRegistries?: readonly string[]
  /** Сгенерированные директории верхнего уровня, исключённые из скана. */
  excludeTopDirs?: readonly string[]
  /** Имя своего токена начинается с префикса владельца. */
  requireOwnerPrefix?: boolean
  /**
   * Владельцы, чьё семейство токенов названо короче имени компонента:
   * `GrProgressBar` → `--gr-progress-`. Имя токена — публичный контракт темы, и
   * переименование ради буквальности стоило бы потребителю мажорной версии.
   */
  ownerPrefixOverrides?: Readonly<Record<string, string>>
  /** Переменная из `themes/<тема>/**` зарегистрирована владельцем как `kind: "theme"`. */
  requireThemeKind?: boolean
  /** В `themes/<тема>/**` компонента — только вид `theme`: хук тема не задаёт. */
  themeKindOnly?: boolean
  /** В пакете есть хотя бы один компонент со своими токенами. */
  requireRegistries?: boolean
  /**
   * Значения компонентов пакета в темах (раздел `components` исходника темы
   * granum): токен там — вида `theme` своего компонента, хук тема не задаёт.
   */
  themeSources?: ThemeSourcesOption
  /**
   * Токен вида `theme` — свой или глобальный токен темы — читается без
   * запасного значения: значение даёт каждая тема, нехватку называет `doctor`,
   * а фолбэк молча подставил бы значение, которого у темы нет.
   */
  themeTokenFallback?: boolean
  /** Глобальные токены, значение которых даёт каждая тема. По умолчанию — `globalTokens`. */
  globalThemeTokens?: readonly { name: string }[]
  /**
   * Хук с литералом по умолчанию (`var(--gr-x, 10px)`) — только с причиной
   * `literal` в реестре: литерал — механика компонента, а дизайн-решение тема
   * задать не смогла бы, хук она не задаёт.
   */
  hookLiterals?: boolean
  /** У компонентов пакета нет `themesDir` и папок `themes/`: значения живут в темах. */
  themesDirAbsent?: boolean
}

/** Чтение токена в исходниках: `var(--gr-x)` или `var(--gr-x, запасное)`. */
export interface TokenRead {
  token: string
  /** Запасное значение как в тексте; у класса утилиты пробел записан `_`. */
  fallback: string | null
  path: string
}

/** Каждое `var(--gr-…)` исходников с его запасным значением — со вложенными. */
export function collectTokenReads(sources: readonly SourceFile[]): TokenRead[] {
  return sources.flatMap(({ path, source }) => {
    const text = stripComments(source)
    const reads: TokenRead[] = []
    for (const match of text.matchAll(/var\((--gr-[a-z0-9-]+)/g)) {
      let depth = 0
      let comma = -1
      for (let i = match.index; i < text.length; i++) {
        const char = text[i]
        if (char === '(') {
          depth++
        }
        else if (char === ')') {
          if (--depth === 0) {
            reads.push({ token: match[1]!, fallback: comma === -1 ? null : text.slice(comma + 1, i).trim(), path })
            break
          }
        }
        else if (char === ',' && depth === 1 && comma === -1) {
          comma = i
        }
      }
    }
    return reads
  })
}

function entryOf(registered: ReadonlyMap<string, TokenRegistry>, name: string): RegisteredToken | undefined {
  return registered.get(name)?.tokens.find(token => token.name === name)
}

/** Запасное значение, вычисленное кодом (`${…}`), — ступень или проп компонента, а не литерал в тексте. */
const isComputed = (fallback: string): boolean => fallback.includes('${')

/** Токен темы — свой вида `theme` или глобальный — прочитан с запасным значением. */
export function collectThemeTokenFallbacks(
  reads: readonly TokenRead[],
  registered: ReadonlyMap<string, TokenRegistry>,
  globalThemeTokens: ReadonlySet<string>,
): string[] {
  return [...new Set(reads
    .filter(read => read.fallback !== null && (globalThemeTokens.has(read.token) || entryOf(registered, read.token)?.kind === 'theme'))
    .map(read => `${read.token}, ${read.fallback} (${read.path})`))].sort()
}

/** Хук прочитан с литералом, а причины `literal` у него в реестре нет. */
export function collectHookLiterals(reads: readonly TokenRead[], registered: ReadonlyMap<string, TokenRegistry>): string[] {
  return [...new Set(reads
    .filter((read) => {
      const entry = entryOf(registered, read.token)
      if (entry?.kind !== 'hook' || read.fallback === null || isComputed(read.fallback))
        return false
      return !read.fallback.replaceAll('_', ' ').startsWith('var(') && !entry.literal?.trim()
    })
    .map(read => `${read.token}, ${read.fallback} (${read.path})`))].sort()
}

/** Причина `literal` у токена, который не хук или нигде не читается с литералом. */
export function collectStaleLiteralReasons(reads: readonly TokenRead[], registries: readonly TokenRegistry[]): string[] {
  const literal = new Set(reads
    .filter(read => read.fallback !== null && (isComputed(read.fallback) || !read.fallback.replaceAll('_', ' ').startsWith('var(')))
    .map(read => read.token))
  return registries.flatMap(registry => registry.tokens
    .filter(token => token.literal !== undefined && (token.kind !== 'hook' || !literal.has(token.name)))
    .map(token => `${token.name} (${registry.path})`))
}

/** `themesDir` в `config.ts` компонента либо папка `themes/` рядом с ним. */
export function collectThemesDirUsage(srcDir: string, prefix = 'Gr'): string[] {
  const componentsDir = resolve(srcDir, 'components')
  return componentDirs(componentsDir, prefix).flatMap((owner) => {
    const config = resolve(componentsDir, owner, 'config.ts')
    const found: string[] = []
    if (existsSync(config) && /\bthemesDir\s*:/.test(stripComments(readFileSync(config, 'utf8'))))
      found.push(`src/components/${owner}/config.ts: themesDir`)
    if (existsSync(resolve(componentsDir, owner, 'themes')))
      found.push(`src/components/${owner}/themes/`)
    return found
  })
}

/** Значения одного компонента в одной теме: файлы раздела и токены в них. */
interface ThemeSection {
  theme: string
  owner: string
  files: SourceFile[]
  tokens: string[]
}

function sectionFiles(dir: string, baseDir: string): SourceFile[] {
  const modesDir = join(dir, 'modes')
  const files = [
    ...readdirSync(dir).map(name => join(dir, name)),
    ...(existsSync(modesDir) ? readdirSync(modesDir).map(name => join(modesDir, name)) : []),
  ].filter(file => /\.(?:json|css)$/.test(file)).sort()
  return files.map((file) => {
    const text = readFileSync(file, 'utf8')
    const source = file.endsWith('.json')
      ? Object.entries(JSON.parse(text) as Record<string, string>).filter(([name]) => !name.startsWith('$')).map(([name, value]) => `--${name}: ${value};`).join('\n')
      : text
    return { path: relative(baseDir, file), source }
  })
}

/** Разделы компонентов пакета во всех темах папки. */
export function readThemeSections({ themesDir, packageId }: ThemeSourcesOption): ThemeSection[] {
  if (!existsSync(themesDir))
    return []
  return readdirSync(themesDir, { withFileTypes: true })
    .filter(theme => theme.isDirectory() && existsSync(join(themesDir, theme.name, 'theme.json')))
    .flatMap((theme) => {
      const dir = join(themesDir, theme.name, 'components', ...packageId.split('/'))
      if (!existsSync(dir))
        return []
      return readdirSync(dir, { withFileTypes: true }).filter(entry => entry.isDirectory()).map((entry) => {
        const files = sectionFiles(join(dir, entry.name), themesDir)
        const tokens = [...new Set(files.flatMap(({ source }) => [...source.matchAll(/(--gr-[a-z0-9-]+)\s*:/g)].map(match => match[1]!)))].sort()
        return { theme: theme.name, owner: entry.name, files, tokens }
      })
    })
}

/** В разделе темы — токен, который не вида `theme` своего компонента, либо компонента такого нет. */
export function collectSectionKindIssues(sections: readonly ThemeSection[], registries: readonly TokenRegistry[]): string[] {
  const byOwner = new Map(registries.map(registry => [registry.owner.split('/').at(-1)!, registry]))
  return sections.flatMap((section) => {
    const registry = byOwner.get(section.owner)
    if (!registry)
      return [`${section.theme}: раздел ${section.owner} — у пакета нет компонента с реестром токенов`]
    return section.tokens
      .filter(name => registry.tokens.find(token => token.name === name)?.kind !== 'theme')
      .map((name) => {
        const kind = registry.tokens.find(token => token.name === name)?.kind
        return `${section.theme}: ${name} в разделе ${section.owner} — ${kind === undefined ? 'не токен компонента' : `вид ${kind}, а тема задаёт только вид theme`}`
      })
  })
}

/** `GrDatePicker` → `--gr-date-picker-` */
export function ownerPrefix(owner: string): string {
  return `--gr-${owner.replace(/^Gr/, '').replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}-`
}

function readRegistry(path: string, owner: string, sourceDir: string, prefixed: boolean): TokenRegistry | null {
  const full = resolve(sourceDir, 'tokens.json')
  if (!existsSync(full))
    return null

  const parsed = JSON.parse(readFileSync(full, 'utf8')) as { tokens: RegisteredToken[] }

  return { owner, path, sourceDir, prefixed, tokens: parsed.tokens }
}

/**
 * Файлы тем компонента (`themesDir` granum): `<тема>/root.{json,css}` и
 * `<тема>/modes/<режим>.{json,css}`. JSON отдаётся строками `--имя: значение;`,
 * чтобы скан видел в нём и объявления, и ссылки на чужие токены — как в CSS.
 * Путь — относительно `baseDir`.
 */
export function readThemeSources(themesDir: string, baseDir: string = themesDir): SourceFile[] {
  if (!existsSync(themesDir))
    return []

  const files = readdirSync(themesDir, { withFileTypes: true })
    .filter(theme => theme.isDirectory())
    .flatMap((theme) => {
      const dir = join(themesDir, theme.name)
      const modesDir = join(dir, 'modes')
      const modes = existsSync(modesDir) ? readdirSync(modesDir).map(name => join(modesDir, name)) : []

      return [...readdirSync(dir).map(name => join(dir, name)), ...modes]
    })
    .filter(file => /\.(?:json|css)$/.test(file))
    .sort()

  return files.map((file) => {
    const text = readFileSync(file, 'utf8')
    const source = file.endsWith('.json')
      ? Object.entries(JSON.parse(text) as Record<string, string>).map(([name, value]) => `--${name}: ${value};`).join('\n')
      : text

    return { path: relative(baseDir, file), source }
  })
}

/** Темы всех компонентов пакета — пути от `srcDir`, как у `readSources`. */
export function readComponentThemeSources(srcDir: string, prefix = 'Gr'): SourceFile[] {
  const componentsDir = resolve(srcDir, 'components')

  return componentDirs(componentsDir, prefix)
    .flatMap(owner => readThemeSources(resolve(componentsDir, owner, 'themes'), srcDir))
}

/** Реестры пакета: по одному на компонент плюс объявленные отдельно. */
export function readTokenRegistries(srcDir: string, extraRegistries: readonly string[] = [], prefix = 'Gr'): TokenRegistry[] {
  const componentsDir = resolve(srcDir, 'components')

  return [
    ...componentDirs(componentsDir, prefix).map(owner => readRegistry(
      `src/components/${owner}/tokens.json`,
      owner,
      resolve(componentsDir, owner),
      true,
    )),
    ...extraRegistries.map(dir => readRegistry(
      `src/${dir}/tokens.json`,
      dir,
      resolve(srcDir, dir),
      false,
    )),
  ].filter((registry): registry is TokenRegistry => registry !== null)
}

/** Употреблено, но нигде не объявлено: опечатка либо забытая регистрация. */
export function collectUnknownTokens(
  sources: readonly SourceFile[],
  globalTokens: ReadonlySet<string>,
  registered: ReadonlyMap<string, TokenRegistry>,
): string[] {
  const unknown = sources.flatMap(({ path, source }) => [...tokenNamesIn(source)]
    .filter(name => !globalTokens.has(name) && !registered.has(name))
    .map(name => `${name} (${path})`))

  return [...new Set(unknown)].sort()
}

/** Зарегистрировано, но в исходниках владельца не встречается. */
export function collectStaleTokens(registries: readonly TokenRegistry[]): string[] {
  return registries.flatMap((registry) => {
    /*
     * Ищем не только в директории владельца, но и в `components/shared/`.
     *
     * Общий хелпер, которым пользуются несколько компонентов, обязан лежать вне
     * `components/<Name>/`: импорт из директории другого компонента granum
     * считает ребром графа компонентов, и заявить его значит оплатить чужой CSS
     * и safelist целиком. Токены такой хелпер при этом читает владельческие —
     * искать их только у владельца значит требовать держать хелпер там, где
     * ему нельзя.
     */
    const shared = resolve(registry.sourceDir, '..', 'shared')
    const dirs = existsSync(shared) ? [registry.sourceDir, shared] : [registry.sourceDir]
    const sources = [...dirs.flatMap(dir => readSources({ dir })), ...readThemeSources(resolve(registry.sourceDir, 'themes'))]
    const used = new Set(sources.flatMap(({ source }) => [...tokenNamesIn(source)]))

    return registry.tokens.filter(token => !used.has(token.name)).map(token => `${token.name} (${registry.path})`)
  })
}

/**
 * Объявлено в `themes/<тема>/**` компонента, но у владельца записано не как
 * `theme`: `css` и `inline` присваивает сам компонент, и значение темы спорило бы
 * с ним. Хук допускается, пока не включён `themeKindOnly`: хук — ручка
 * приложения, и тема его не задаёт.
 */
export function collectWrongThemeKind(
  registries: readonly TokenRegistry[],
  registered: ReadonlyMap<string, TokenRegistry>,
  allowed: readonly string[] = ['theme', 'hook'],
): string[] {
  return registries.flatMap((registry) => {
    const declared = readThemeSources(resolve(registry.sourceDir, 'themes')).flatMap(({ source }) =>
      [...source.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/(--gr-[a-z0-9-]+)\s*:/g)]
        .map(match => match[1])
        .filter((name): name is string => name !== undefined))

    return [...new Set(declared)]
      .filter(name => registered.get(name)?.owner !== registry.owner
        || !allowed.includes(registered.get(name)?.tokens.find(token => token.name === name)?.kind ?? ''))
      .map(name => `${name} (${registry.path})`)
  })
}

/** Своё имя без префикса владельца: тема будет искать токен не там. */
export function collectMisnamedTokens(
  registries: readonly TokenRegistry[],
  overrides: Readonly<Record<string, string>> = {},
): string[] {
  return registries.filter(registry => registry.prefixed).flatMap((registry) => {
    const prefix = overrides[registry.owner] ?? ownerPrefix(registry.owner)

    return registry.tokens.filter(token => !token.name.startsWith(prefix))
      .map(token => `${token.name} (ожидался префикс ${prefix})`)
  })
}

/** Запись реестра без обязательного поля — она не попадёт в доку осмысленно. */
export function collectBrokenEntries(registries: readonly TokenRegistry[]): string[] {
  return registries.flatMap(registry => registry.tokens
    .filter(token => !/^--gr-[a-z0-9-]+$/.test(token.name ?? '')
      || !TOKEN_KINDS.has(token.kind)
      || !token.default?.trim()
      || !token.description?.trim())
    .map(token => `${token.name ?? '<без имени>'} (${registry.path})`))
}

/**
 * Гейт покомпонентного контракта тем.
 *
 * Покомпонентные переменные (`--gr-tree-row-py`, `--gr-calendar-selected-bg`)
 * потребитель видит как публичный API темизации: он их переопределяет. Без
 * реестра пакет не видит их вовсе — переименование не роняет ни одного теста, а
 * узнать имя можно только из исходников. Реестр `tokens.json` рядом с
 * компонентом закрывает обе дыры: имя объявлено, и оно попадает в доку вместе с
 * природой (`kind`) и дефолтом.
 *
 * CSS из реестра не генерируется намеренно: `hook`-токены обязаны остаться
 * неприсвоенными, иначе `var(--gr-x, дефолт)` перестанет падать на дефолт.
 *
 * Чужие токены легальны как **употребление**, но не как объявление: опечатка в
 * чужом имени — самая дешёвая ошибка из возможных (`var(--gr-destructive)` в
 * предшественнике не красил ничего и молчал), и ловится она именно здесь.
 */
export function defineComponentTokensGate(options: ComponentTokensGateOptions): void {
  const srcDir = options.srcDir ?? packageSrcDir()
  const registries = readTokenRegistries(srcDir, options.extraRegistries, options.prefix)
  const registered = new Map(registries.flatMap(registry => registry.tokens.map(token => [token.name, registry] as const)))
  const globalTokens = new Set(options.globalTokens.map(token => token.name))
  const sections = options.themeSources ? readThemeSections(options.themeSources) : []

  describe('покомпонентные токены', () => {
    it('каждая переменная в исходниках объявлена — глобально или в реестре компонента', () => {
      const sources = [
        ...readSources({ dir: srcDir, excludeTopDirs: options.excludeTopDirs }),
        ...readComponentThemeSources(srcDir, options.prefix),
        ...sections.flatMap(section => section.files),
      ]

      expect(
        collectUnknownTokens(sources, globalTokens, registered),
        'опечатка в чужом имени либо незарегистрированный свой токен — заведи его в `tokens.json` компонента',
      ).toEqual([])
    })

    it('реестр не протух: зарегистрированное встречается в исходниках владельца', () => {
      expect(collectStaleTokens(registries), 'токен больше не используется — убери его из реестра').toEqual([])
    })

    it('реестр не переопределяет то, что объявлено вне его', () => {
      const shadowed = [...registered.keys()].filter(name => globalTokens.has(name))

      expect(shadowed, 'имя занято ролью темы, примитивом или хуком чужого компонента').toEqual([])
    })

    it.runIf(options.requireThemeKind ?? true)('токены покомпонентных тем зарегистрированы как `theme`', () => {
      expect(
        collectWrongThemeKind(registries, registered, options.themeKindOnly ? ['theme'] : ['theme', 'hook']),
        options.themeKindOnly ? 'объявлен в `themes/<тема>/` — значит `kind: "theme"` у своего компонента' : 'объявлен в `themes/<тема>/` — значит `kind: "theme"` или `"hook"` у своего компонента',
      ).toEqual([])
    })

    it.runIf(options.requireOwnerPrefix ?? true)('имя своего токена начинается с имени владельца', () => {
      // Иначе хук `GrDatePicker` мог бы называться `--gr-calendar-*` и
      // переопределяться темой не там, где ожидает потребитель.
      expect(collectMisnamedTokens(registries, options.ownerPrefixOverrides)).toEqual([])
    })

    it('записи реестра заполнены полностью', () => {
      expect(
        collectBrokenEntries(registries),
        `обязательны name, kind (${[...TOKEN_KINDS].join('|')}), default, description`,
      ).toEqual([])
    })

    it.runIf(options.requireRegistries ?? true)('в пакете есть компоненты со своими токенами', () => {
      // Гейт на пустом списке зелен всегда.
      expect(registries.length).toBeGreaterThan(0)
    })

    it.runIf(options.themeSources !== undefined)('в разделе компонента темы — только токены вида `theme` этого компонента', () => {
      expect(sections.length, 'разделов не найдено — проверь themeSources').toBeGreaterThan(0)
      expect(collectSectionKindIssues(sections, registries), 'хук тема не задаёт: он ручка приложения; токен, который задаёт тема, — вида `theme`').toEqual([])
    })

    it.runIf(options.themeTokenFallback ?? false)('токен темы читается без запасного значения', () => {
      const reads = collectTokenReads(readSources({ dir: srcDir, excludeTopDirs: options.excludeTopDirs }))
      const globalThemeTokens = new Set((options.globalThemeTokens ?? options.globalTokens).map(token => token.name))
      expect(
        collectThemeTokenFallbacks(reads, registered, globalThemeTokens),
        'значение даёт каждая тема: фолбэк подставил бы значение, которого у темы нет, вместо находки `doctor`',
      ).toEqual([])
    })

    it.runIf(options.hookLiterals ?? false)('хук с литералом по умолчанию — с причиной `literal` в реестре', () => {
      const reads = collectTokenReads(readSources({ dir: srcDir, excludeTopDirs: options.excludeTopDirs }))
      expect(
        collectHookLiterals(reads, registered),
        'литерал хука — механика компонента: запиши причину в `literal` либо сделай токен видом `theme` со значением в каждой теме',
      ).toEqual([])
      expect(collectStaleLiteralReasons(reads, registries), 'причина `literal` у токена без литерала по умолчанию — убери её').toEqual([])
    })

    it.runIf(options.themesDirAbsent ?? false)('у компонентов нет `themesDir`: значения живут в темах', () => {
      expect(collectThemesDirUsage(srcDir, options.prefix), 'значения компонента — в разделе `components/<пакет>/<Компонент>/` исходника темы').toEqual([])
    })
  })
}
