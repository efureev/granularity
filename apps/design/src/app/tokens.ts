import {
  grFoundationTokens,
  grRoleTokens,
  type GrFoundationToken,
  type GrRoleToken,
  type GrThemeData,
  resolveModes,
} from '@feugene/granularity-tokens'

/** Режим темы: `light`, `dark` или свой. */
export type ModeName = string

/** Тема, которую показывают страницы основ: данные, режимы с раскрытым `extends`, их порядок. */
export interface ThemeView {
  readonly id: string
  readonly data: GrThemeData
  readonly modes: ReadonlyMap<ModeName, Readonly<Record<string, string>>>
  /** Режимы в порядке данных — колонки таблиц контраста. */
  readonly modeList: readonly { readonly id: ModeName, readonly label: string }[]
}

export function themeView(data: GrThemeData): ThemeView {
  return {
    id: data.id,
    data,
    modes: resolveModes(data),
    modeList: Object.entries(data.modes).map(([id, mode]) => ({ id, label: mode.title ?? id })),
  }
}

export type FoundationToken = GrFoundationToken & { value: string }

export function themeSection(section: string): GrRoleToken[] {
  return grRoleTokens.filter(token => token.section === section)
}

export function foundationSection(theme: ThemeView, section: string): FoundationToken[] {
  return grFoundationTokens
    .filter(token => token.section === section)
    .map(token => ({ ...token, value: theme.data.root[token.name.slice(2)] ?? '' }))
}

const roleNames = new Set(grRoleTokens.map(token => token.name))

export function hasThemeToken(name: string): boolean {
  return roleNames.has(name)
}

export function foundationValue(theme: ThemeView, name: string): string | undefined {
  return theme.data.root[name.slice(2)]
}

/** Своё значение режима темы — для производного токена: у «Глины» часть их задана числом, а не формулой. */
export function modeValue(theme: ThemeView, mode: ModeName, name: string): string | undefined {
  return theme.modes.get(mode)?.[name.slice(2)]
}

/**
 * Значение роли в режиме темы с раскрытыми ссылками `var(--gr-x)`. Формулы
 * `color-mix` не вычисляются — для них возвращается `undefined`.
 */
export function resolveColor(theme: ThemeView, name: string, mode: ModeName, depth = 0): string | undefined {
  if (depth > 8)
    return undefined
  const raw = modeValue(theme, mode, name) ?? foundationValue(theme, name)
  if (!raw)
    return undefined
  const reference = raw.match(/^var\((--[\w-]+)\)$/)
  if (reference)
    return resolveColor(theme, reference[1], mode, depth + 1)
  return /^#[\da-f]{6}$/i.test(raw) ? raw.toLowerCase() : undefined
}

function channel(hex: string, offset: number): number {
  const value = Number.parseInt(hex.slice(offset, offset + 2), 16) / 255
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
}

function luminance(hex: string): number {
  return 0.2126 * channel(hex, 1) + 0.7152 * channel(hex, 3) + 0.0722 * channel(hex, 5)
}

/** Контраст по WCAG 2.x для двух непрозрачных `#rrggbb`. */
export function contrastRatio(foreground: string, background: string): number {
  const [light, dark] = [luminance(foreground), luminance(background)].sort((a, b) => b - a) as [number, number]
  return (light + 0.05) / (dark + 0.05)
}
