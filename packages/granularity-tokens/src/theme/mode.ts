import { grDerivedTokens, grRoleTokens } from '../generated'
import { resolveModes } from '../modes'
import type { GrColorScheme, GrModeFallback, GrThemeData } from '../types'
import { GR_BUILTIN_THEME, grBuiltinModes, grBuiltinModeSchemes, type GrBuiltinMode } from './builtin.generated'
import { mixSrgb } from './color'
import { NO_COLOR_MIX } from './defineTheme'
import { GrThemeDefinitionError, GrThemeError, MODE_NAME } from './errors'
import { resolveRole, themeRoleNames, type GrThemeTokens } from './roles'
import { validateTheme } from './validate'

/**
 * Вход `modes.define.<имя>` конфига granum: режим поверх режима темы. Ключи —
 * без `--`; роли — только отличия от базы, токены компонентов — все заданные.
 */
export interface GrModeDefinition {
  extends: string
  colorScheme: GrColorScheme
  title?: string
  tokens: Record<string, string>
}

export interface GrMode {
  name: string
  title?: string
  /** Тема, чей режим лежит в основе: из неё пара `<тема>-<режим>` селектора. */
  theme: string
  colorScheme: GrColorScheme
  /** Селектор CSS режима: по умолчанию его пара `[data-theme="<тема>-<режим>"]`. */
  selector: string
  /** Полный набор ролей: своё поверх базы. */
  tokens: GrThemeTokens
  /** Покомпонентные токены режима, если заданы. */
  componentTokens: GrThemeTokens
  /** Готовый CSS, включая фолбэк производных для браузеров без `color-mix`. */
  css: string
  /** Тот же режим входом `modes.define` granum. */
  definition: GrModeDefinition
  /**
   * Производные, посчитанные от ролей режима, — для браузеров без `color-mix`.
   * В `modes.define` с granum 3.4: `{ ...mode.definition, fallbacks: mode.fallbacks }`;
   * без них режим берёт фолбэки базы, посчитанные от её ролей.
   */
  fallbacks: GrModeFallback[]
}

/** Режим темы данными — например своей темы приложения из `loadTheme`. */
export interface GrThemeModeRef {
  theme: GrThemeData
  mode: string
}

/**
 * База режима: режим встроенной темы по имени, режим любой темы данными,
 * готовый режим или просто набор ролей.
 */
export type GrModeBase = GrBuiltinMode | GrThemeModeRef | GrMode | GrThemeTokens

export interface CreateModeOptions {
  /** Имя режима: slug без дефиса — пара `<тема>-<режим>` разбирается по последнему. */
  name: string
  title?: string
  /** Что меняем. Всё, чего здесь нет, приходит из базы. */
  tokens?: GrThemeTokens
  /**
   * Покомпонентные токены (`--gr-button-primary-bg`) — у них своя природа:
   * пакет держит для них отдельный слой и **не** наследует их между режимами.
   * Поэтому они не достраиваются из базы, а просто едут в тот же селектор:
   * заданы — переопределены, не заданы — работает значение режима `extends`.
   */
  componentTokens?: GrThemeTokens
  /**
   * Имена покомпонентных токенов, которые режим вправе задать. Реестр
   * компонентов живёт у пакетов с компонентами (`grComponentTokens` из
   * `@feugene/granularity/tokens`), а пакет токенов от них не зависит — поэтому
   * список передаёт тот, кто режим собирает. Без него имена не сверяются.
   */
  knownComponentTokens?: readonly string[]
  /** Схема браузера (`color-scheme`). По умолчанию — схема базы, у режима с нуля — `light`. */
  colorScheme?: GrColorScheme
  /**
   * Режим темы, от которого granum возьмёт этот режим за основу: токены
   * компонентов, которых режим не задал. По умолчанию — база; у режима с нуля и
   * у набора ролей — первый режим встроенной темы с той же схемой.
   */
  extends?: string
  /** Тема, чью пару получает селектор по умолчанию. По умолчанию — тема базы. */
  theme?: string
  selector?: string
  /**
   * Проверка контраста и различимости тонов перед выдачей. Включена: режим,
   * который не читается, — это дефект, и узнать о нём на сборке дешевле, чем от
   * пользователя. Выключать осознанно, для заведомо декоративных режимов.
   */
  validate?: boolean
}

export interface ExtendModeOptions extends CreateModeOptions {
  base: GrModeBase
}

const bare = (name: string): string => name.replace(/^--/, '')

function dashed(tokens: Readonly<Record<string, string>>): GrThemeTokens {
  return Object.fromEntries(Object.entries(tokens).map(([name, value]) => [name.startsWith('--') ? name : `--${name}`, value]))
}

function isThemeModeRef(base: GrModeBase): base is GrThemeModeRef {
  return typeof base === 'object' && 'mode' in base && typeof (base as GrThemeModeRef).theme === 'object'
}

function isMode(base: GrModeBase): base is GrMode {
  return typeof base === 'object' && 'definition' in base && 'tokens' in base
}

function builtinFor(colorScheme: GrColorScheme): string {
  const found = (Object.keys(grBuiltinModeSchemes) as GrBuiltinMode[]).find(name => grBuiltinModeSchemes[name] === colorScheme)
  return found ?? Object.keys(grBuiltinModes)[0]
}

interface ResolvedBase {
  tokens: GrThemeTokens
  theme: string
  colorScheme?: GrColorScheme
  extends?: string
}

function resolveBase(base: GrModeBase): ResolvedBase {
  if (typeof base === 'string') {
    const known = Object.keys(grBuiltinModes)
    if (!known.includes(base))
      throw new GrThemeDefinitionError('mode-extends-unresolved', `неизвестный режим-база "${base}"; у темы ${GR_BUILTIN_THEME}: ${known.join(', ')}`)

    return { tokens: { ...grBuiltinModes[base] }, theme: GR_BUILTIN_THEME, colorScheme: grBuiltinModeSchemes[base], extends: base }
  }

  if (isThemeModeRef(base)) {
    const tokens = resolveModes(base.theme).get(base.mode)
    if (!tokens) {
      throw new GrThemeDefinitionError(
        'mode-extends-unresolved',
        `у темы "${base.theme.id}" нет режима "${base.mode}"; есть ${Object.keys(base.theme.modes).join(', ')}`,
      )
    }

    return { tokens: dashed(tokens), theme: base.theme.id, colorScheme: base.theme.modes[base.mode].colorScheme, extends: base.mode }
  }

  if (isMode(base))
    return { tokens: { ...base.tokens }, theme: base.theme, colorScheme: base.colorScheme, extends: base.name }

  return { tokens: { ...base }, theme: GR_BUILTIN_THEME }
}

function renderDeclarations(tokens: GrThemeTokens, indent: string): string[] {
  return grRoleTokens.map(token => `${indent}${token.name}: ${tokens[token.name]};`)
}

function renderComponentDeclarations(tokens: GrThemeTokens, indent: string): string[] {
  const names = Object.keys(tokens)
  if (names.length === 0)
    return []

  return ['', `${indent}/* Покомпонентные токены режима. */`, ...names.map(name => `${indent}${name}: ${tokens[name]};`)]
}

/**
 * Фолбэк производных состояний для браузеров без `color-mix`.
 *
 * Без него режим наследует фолбэки из `:root`, то есть чужие: hover у тёмного
 * режима окажется от светлого. Формула та же, что в `tokens.css`, — считает
 * её общая математика (`color.ts`), поэтому разойтись с живым `color-mix` не
 * может.
 */
/** Производные режима в hex: `--gr-primary-hover` → `#4338ca`. */
function fallbackValues(tokens: GrThemeTokens): Array<[string, string]> {
  const values: Array<[string, string]> = []
  for (const token of grDerivedTokens) {
    const base = resolveRole(tokens, token.base)
    const mixWith = resolveRole(tokens, token.mixWith)

    // Роль ссылается не на цвет (например на `var()` вне темы) — фолбэк для неё
    // посчитать нечем, и выдумывать значение хуже, чем его не давать.
    if (!base || !mixWith)
      continue

    values.push([token.name, mixSrgb(base, mixWith, token.amount)])
  }
  return values
}

function renderFallback(tokens: GrThemeTokens, selector: string): string[] {
  return [
    '',
    `@supports ${NO_COLOR_MIX} {`,
    `  ${selector} {`,
    ...fallbackValues(tokens).map(([token, value]) => `    ${token}: ${value};`),
    '  }',
    '}',
  ]
}

export function renderModeCss(mode: Pick<GrMode, 'name' | 'selector' | 'tokens'> & Partial<Pick<GrMode, 'componentTokens'>>): string {
  return [
    `/* Режим "${mode.name}" собран из @feugene/granularity-tokens/theme — правки здесь потеряются. */`,
    `${mode.selector} {`,
    ...renderDeclarations(mode.tokens, '  '),
    ...renderComponentDeclarations(mode.componentTokens ?? {}, '  '),
    '}',
    ...renderFallback(mode.tokens, mode.selector),
    '',
  ].join('\n')
}

interface BuildOptions extends CreateModeOptions {
  tokens: GrThemeTokens
  base?: ResolvedBase
  /** Что сказать, если ролей не хватает: у режима с базой и без базы причины разные. */
  explainMissing: (missing: string[]) => string
}

function buildMode(options: BuildOptions): GrMode {
  const { name, tokens, base, explainMissing, componentTokens: rawComponentTokens = {}, knownComponentTokens } = options

  if (!MODE_NAME.test(name) || name === 'root')
    throw new GrThemeDefinitionError('invalid-mode-name', `имя режима "${name}" — ожидается ${MODE_NAME}, кроме \`root\``)

  const known = new Set(themeRoleNames())
  const unknown = Object.keys(tokens).filter(role => !known.has(role))

  if (unknown.length > 0) {
    throw new GrThemeDefinitionError(
      'unknown-token',
      `режим "${name}" объявляет роли, которых у пакета нет: ${unknown.join(', ')}.\n`
      + 'Примитивы (`--gr-space-*`, `--gr-radius-*`) и производные (`-hover`/`-active`) режимом не задаются: '
      + 'первые от режима не зависят, вторые выводятся формулой.',
    )
  }

  const componentTokens = dashed(rawComponentTokens)
  const knownComponent = new Set(knownComponentTokens ?? [])
  const unknownComponent = knownComponentTokens
    ? Object.keys(componentTokens).filter(token => !knownComponent.has(token))
    : []

  if (unknownComponent.length > 0)
    throw new GrThemeDefinitionError('unknown-token', `режим "${name}" объявляет покомпонентные токены, которых у пакета нет: ${unknownComponent.join(', ')}`)

  const missing = themeRoleNames().filter(role => tokens[role] === undefined)
  if (missing.length > 0)
    throw new GrThemeDefinitionError('theme-incomplete', explainMissing(missing))

  const colorScheme = options.colorScheme ?? base?.colorScheme ?? 'light'
  const theme = options.theme ?? base?.theme ?? GR_BUILTIN_THEME
  const selector = options.selector ?? `[data-theme="${theme}-${name}"]`
  const roles = base
    ? Object.fromEntries(Object.entries(tokens).filter(([role, value]) => base.tokens[role] !== value))
    : tokens

  const mode: GrMode = {
    name,
    ...(options.title !== undefined ? { title: options.title } : {}),
    theme,
    colorScheme,
    selector,
    tokens,
    componentTokens,
    css: renderModeCss({ name, selector, tokens, componentTokens }),
    definition: {
      extends: options.extends ?? base?.extends ?? builtinFor(colorScheme),
      colorScheme,
      ...(options.title !== undefined ? { title: options.title } : {}),
      tokens: Object.fromEntries([...Object.entries(roles), ...Object.entries(componentTokens)].map(([token, value]) => [bare(token), value])),
    },
    fallbacks: (() => {
      const values = fallbackValues(tokens)
      return values.length > 0 ? [{ supports: NO_COLOR_MIX, tokens: Object.fromEntries(values.map(([token, value]) => [bare(token), value])) }] : []
    })(),
  }

  if (options.validate !== false) {
    const issues = validateTheme(mode)
    if (issues.length > 0)
      throw new GrThemeError(name, issues)
  }

  return mode
}

/**
 * Режим поверх готового: объявляем только то, что меняем.
 *
 * Роль, которую режим не объявил, в CSS наследуется не от «своей» базы, а из
 * `:root`, то есть из режима по умолчанию: тёмный режим с забытой ролью
 * получает светлое пятно. Поэтому здесь режим достраивается до полного набора
 * **всех** ролей пакета — и роль, добавленная пакетом завтра, приедет в него
 * сама, без правок потребителя.
 *
 * Базой может быть любой режим любой темы: `'dark'` встроенной темы,
 * `{ theme: brand, mode: 'dark' }` своей, другой собранный режим.
 */
export function extendMode(options: ExtendModeOptions): GrMode {
  const base = resolveBase(options.base)

  return buildMode({
    ...options,
    base,
    tokens: { ...base.tokens, ...dashed(options.tokens ?? {}) },
    explainMissing: missing => `база режима "${options.name}" не даёт ролей: ${missing.join(', ')}`,
  })
}

/**
 * Режим с нуля: без базы, все роли свои.
 *
 * «Без базы» — это не «ни от чего не наследуется»: в CSS так нельзя. Роль,
 * которую режим не объявил, придёт из `:root`, а `:root` — это **режим по
 * умолчанию темы**. Независимым режим становится ровно тогда, когда объявляет
 * все роли сам, и здесь это проверяется: не хватает — сборка падает со списком,
 * а не молча подмешивает чужую палитру.
 *
 * Цена честная и её видно: `extendMode` получает новую роль пакета
 * автоматически, а режим с нуля — упадёт на следующей сборке и потребует
 * решения. Это и есть смысл выбора: полный контроль в обмен на сопровождение.
 */
export function createMode(options: CreateModeOptions): GrMode {
  return buildMode({
    ...options,
    tokens: dashed(options.tokens ?? {}),
    explainMissing: missing => [
      `режим "${options.name}" объявлен без базы, но не задаёт ${missing.length} ролей:`,
      `  ${missing.join(', ')}`,
      'Незаявленная роль придёт не «ниоткуда», а из `:root` — то есть из режима по умолчанию темы.',
      'Задайте их, либо соберите режим поверх готового: `extendMode({ base: \'light\' | \'dark\', tokens })`.',
    ].join('\n'),
  })
}
