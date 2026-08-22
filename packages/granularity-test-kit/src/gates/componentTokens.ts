import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import { componentDirs, packageSrcDir, readSources, tokenNamesIn, type SourceFile } from '../sources'

/** Запись реестра `tokens.json` рядом с компонентом. */
export interface RegisteredToken {
  name: string
  kind: string
  default: string
  description: string
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
  /** Переменная из `themes/*.css` зарегистрирована владельцем как `kind: "theme"`. */
  requireThemeKind?: boolean
  /** В пакете есть хотя бы один компонент со своими токенами. */
  requireRegistries?: boolean
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
    const used = new Set(readSources({ dir: registry.sourceDir }).flatMap(({ source }) => [...tokenNamesIn(source)]))

    return registry.tokens.filter(token => !used.has(token.name)).map(token => `${token.name} (${registry.path})`)
  })
}

/** Объявлено в `themes/*.css`, но у владельца записано не как `theme`. */
export function collectWrongThemeKind(
  registries: readonly TokenRegistry[],
  registered: ReadonlyMap<string, TokenRegistry>,
): string[] {
  return registries.flatMap((registry) => {
    const themesDir = resolve(registry.sourceDir, 'themes')
    if (!existsSync(themesDir))
      return []

    const declared = readSources({ dir: themesDir }).flatMap(({ source }) =>
      [...source.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/(--gr-[a-z0-9-]+)\s*:/g)]
        .map(match => match[1])
        .filter((name): name is string => name !== undefined))

    return [...new Set(declared)]
      .filter(name => registered.get(name)?.owner !== registry.owner
        || registered.get(name)?.tokens.find(token => token.name === name)?.kind !== 'theme')
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

  describe('покомпонентные токены', () => {
    it('каждая переменная в исходниках объявлена — глобально или в реестре компонента', () => {
      const sources = readSources({ dir: srcDir, excludeTopDirs: options.excludeTopDirs })

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
        collectWrongThemeKind(registries, registered),
        'объявлен в `themes/*.css` — значит `kind: "theme"` у своего компонента',
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
  })
}
