import {
  grFoundationTokens,
  grThemeTokens,
  type GrFoundationToken,
  type GrThemeName,
  type GrThemeToken,
} from '@feugene/granularity/tokens'

export const THEMES: { id: GrThemeName, label: string }[] = [
  { id: 'light', label: 'Светлая' },
  { id: 'dark', label: 'Тёмная' },
]

export function themeSection(section: string): GrThemeToken[] {
  return grThemeTokens.filter(token => token.section === section)
}

export function foundationSection(section: string): GrFoundationToken[] {
  return grFoundationTokens.filter(token => token.section === section)
}

const themeByName = new Map(grThemeTokens.map(token => [token.name, token]))
const foundationByName = new Map(grFoundationTokens.map(token => [token.name, token]))

export function hasThemeToken(name: string): boolean {
  return themeByName.has(name)
}

export function foundationValue(name: string): string | undefined {
  return foundationByName.get(name)?.value
}

/**
 * Значение роли в теме с раскрытыми ссылками `var(--gr-x)`. Формулы
 * `color-mix` не вычисляются — для них возвращается `undefined`.
 */
export function resolveColor(name: string, theme: GrThemeName, depth = 0): string | undefined {
  if (depth > 8)
    return undefined
  const raw = themeByName.get(name)?.values[theme] ?? foundationByName.get(name)?.value
  if (!raw)
    return undefined
  const reference = raw.match(/^var\((--[\w-]+)\)$/)
  if (reference)
    return resolveColor(reference[1], theme, depth + 1)
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
