import { grComponentTokens, grDerivedTokens, grThemeTokens } from '../tokens/generated'
import type { GrThemeName } from '../tokens/types'
import { mixSrgb } from './color'
import { resolveRole, themeRoleNames, type GrThemeTokens } from './roles'
import { validateTheme, type GrThemeIssue } from './validate'

export interface GrTheme {
  name: string
  /** Селектор, под которым тема объявлена: по умолчанию `[data-theme='<name>']`. */
  selector: string
  /** Полный набор ролей: своё поверх базы. */
  tokens: GrThemeTokens
  /** Покомпонентные токены темы, если заданы. */
  componentTokens: GrThemeTokens
  /** Готовый CSS, включая фолбэк производных для браузеров без `color-mix`. */
  css: string
}

export interface ExtendThemeOptions {
  name: string
  /** Готовая тема пакета, чужая тема или просто набор ролей. */
  base: GrThemeName | GrTheme | GrThemeTokens
  selector?: string
  /** Что меняем. Всё, чего здесь нет, приходит из базы. */
  tokens?: GrThemeTokens
  /**
   * Покомпонентные токены (`--gr-button-primary-bg`) — у них своя природа:
   * пакет держит для них отдельный слой и **не** наследует их между темами.
   * Поэтому они не достраиваются из базы, а просто едут в тот же селектор:
   * заданы — переопределены, не заданы — работает дефолт компонента.
   */
  componentTokens?: GrThemeTokens
  /**
   * Проверка контраста и различимости тонов перед выдачей. Включена: тема,
   * которая не читается, — это дефект, и узнать о нём на сборке дешевле, чем от
   * пользователя. Выключать осознанно, для заведомо декоративных тем.
   */
  validate?: boolean
}

export class GrThemeError extends Error {
  issues: GrThemeIssue[]

  constructor(name: string, issues: GrThemeIssue[]) {
    super([
      `тема "${name}" не проходит проверку:`,
      ...issues.map(issue => `  • ${issue.message}`),
    ].join('\n'))

    this.name = 'GrThemeError'
    this.issues = issues
  }
}

function baseTokens(base: ExtendThemeOptions['base']): GrThemeTokens {
  if (typeof base === 'string') {
    const known = ['light', 'dark']
    if (!known.includes(base))
      throw new Error(`неизвестная базовая тема "${base}"; встроенные: ${known.join(', ')}`)

    return Object.fromEntries(grThemeTokens.map(token => [token.name, token.values[base]]))
  }

  return 'tokens' in base ? { ...(base as GrTheme).tokens } : { ...base }
}

function renderDeclarations(tokens: GrThemeTokens, indent: string): string[] {
  return grThemeTokens.map(token => `${indent}${token.name}: ${tokens[token.name]};`)
}

function renderComponentDeclarations(tokens: GrThemeTokens, indent: string): string[] {
  const names = Object.keys(tokens)
  if (names.length === 0) return []

  return ['', `${indent}/* Покомпонентные токены темы. */`, ...names.map(name => `${indent}${name}: ${tokens[name]};`)]
}

/**
 * Фолбэк производных состояний для браузеров без `color-mix`.
 *
 * Без него тема наследует фолбэки из `:root`, то есть чужие: hover у кастомной
 * тёмной темы окажется от светлой. Формула та же, что в `tokens.css`, — считает
 * её общая математика (`color.ts`), поэтому разойтись с живым `color-mix` не
 * может.
 */
function renderFallback(tokens: GrThemeTokens, selector: string): string[] {
  const lines = [
    '',
    '@supports not (color: color-mix(in srgb, #000 50%, #fff)) {',
    `  ${selector} {`,
  ]

  for (const token of grDerivedTokens) {
    const base = resolveRole(tokens, token.base)
    const mixWith = resolveRole(tokens, token.mixWith)

    // Роль ссылается не на цвет (например на `var()` вне темы) — фолбэк для неё
    // посчитать нечем, и выдумывать значение хуже, чем его не давать.
    if (!base || !mixWith) continue

    lines.push(`    ${token.name}: ${mixSrgb(base, mixWith, token.amount)};`)
  }

  lines.push('  }', '}')

  return lines
}

export function renderThemeCss(theme: Pick<GrTheme, 'name' | 'selector' | 'tokens'> & Partial<Pick<GrTheme, 'componentTokens'>>): string {
  return [
    `/* Тема "${theme.name}" собрана из @feugene/granularity/theme — правки здесь потеряются. */`,
    `${theme.selector} {`,
    ...renderDeclarations(theme.tokens, '  '),
    ...renderComponentDeclarations(theme.componentTokens ?? {}, '  '),
    '}',
    ...renderFallback(theme.tokens, theme.selector),
    '',
  ].join('\n')
}

interface BuildOptions {
  name: string
  tokens: GrThemeTokens
  componentTokens: GrThemeTokens
  selector: string
  validate: boolean
  /** Что сказать, если ролей не хватает: у темы с базой и без базы причины разные. */
  explainMissing: (missing: string[]) => string
}

function buildTheme(options: BuildOptions): GrTheme {
  const { name, tokens, componentTokens, selector, validate, explainMissing } = options

  const known = new Set(themeRoleNames())
  const unknown = Object.keys(tokens).filter(role => !known.has(role))

  if (unknown.length > 0) {
    throw new Error(
      `тема "${name}" объявляет роли, которых у пакета нет: ${unknown.join(', ')}.\n`
      + 'Примитивы (`--gr-space-*`, `--gr-radius-*`) и производные (`-hover`/`-active`) темой не задаются: '
      + 'первые от темы не зависят, вторые выводятся формулой.',
    )
  }

  const knownComponent = new Set(grComponentTokens.map(token => token.name))
  const unknownComponent = Object.keys(componentTokens).filter(token => !knownComponent.has(token))

  if (unknownComponent.length > 0)
    throw new Error(`тема "${name}" объявляет покомпонентные токены, которых у пакета нет: ${unknownComponent.join(', ')}`)

  const missing = themeRoleNames().filter(role => tokens[role] === undefined)
  if (missing.length > 0) throw new Error(explainMissing(missing))

  const theme: GrTheme = {
    name,
    selector,
    tokens,
    componentTokens,
    css: renderThemeCss({ name, selector, tokens, componentTokens }),
  }

  if (validate) {
    const issues = validateTheme(theme)
    if (issues.length > 0) throw new GrThemeError(name, issues)
  }

  return theme
}

/**
 * Тема поверх готовой: объявляем только то, что меняем.
 *
 * Роль, которую тема не объявила, наследуется не от «своей» базы, а из `:root`,
 * то есть из светлой темы: тёмная тема с забытой ролью получает светлое пятно.
 * Поэтому здесь тема достраивается до полного набора **всех** ролей пакета — и
 * роль, добавленная пакетом завтра, приедет в неё сама, без правок потребителя.
 */
export function extendTheme(options: ExtendThemeOptions): GrTheme {
  const {
    name,
    base,
    tokens = {},
    componentTokens = {},
    selector = `[data-theme='${name}']`,
    validate = true,
  } = options

  return buildTheme({
    name,
    tokens: { ...baseTokens(base), ...tokens },
    componentTokens,
    selector,
    validate,
    explainMissing: missing => `база темы "${name}" не даёт ролей: ${missing.join(', ')}`,
  })
}

/**
 * Тема с нуля: без базы, все роли свои.
 *
 * «Без базы» — это не «ни от чего не наследуется»: в CSS так нельзя. Роль,
 * которую тема не объявила, придёт из `:root`, а `:root` — это **светлая тема
 * пакета**. Независимой тема становится ровно тогда, когда объявляет все роли
 * сама, и здесь это проверяется: не хватает — сборка падает со списком, а не
 * молча подмешивает чужую палитру.
 *
 * Цена честная и её видно: `extendTheme` получает новую роль пакета
 * автоматически, а тема с нуля — упадёт на следующей сборке и потребует решения.
 * Это и есть смысл выбора: полный контроль в обмен на сопровождение.
 */
export function createTheme(options: Omit<ExtendThemeOptions, 'base'>): GrTheme {
  const {
    name,
    tokens = {},
    componentTokens = {},
    selector = `[data-theme='${name}']`,
    validate = true,
  } = options

  return buildTheme({
    name,
    tokens,
    componentTokens,
    selector,
    validate,
    explainMissing: missing => [
      `тема "${name}" объявлена без базы, но не задаёт ${missing.length} ролей:`,
      `  ${missing.join(', ')}`,
      'Незаявленная роль придёт не «ниоткуда», а из `:root` — то есть из светлой темы пакета.',
      'Задайте их, либо соберите тему поверх готовой: `extendTheme({ base: \'light\' | \'dark\', tokens })`.',
    ].join('\n'),
  })
}
