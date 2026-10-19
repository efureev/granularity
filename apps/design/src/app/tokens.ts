import {
  grFoundationTokens,
  grRoleTokens,
  type GrFoundationToken,
  type GrRoleToken,
  type GrThemeData,
  resolveModes,
} from '@feugene/granularity-tokens'
import slateData from '@feugene/granularity-tokens/themes/slate/theme.json'

/** Режим темы `slate` — то, что ядро пока называет темой `light`/`dark`. */
export type ModeName = 'light' | 'dark'

export const THEMES: { id: ModeName, label: string }[] = [
  { id: 'light', label: 'Светлая' },
  { id: 'dark', label: 'Тёмная' },
]

const slate = slateData as GrThemeData
const slateModes = resolveModes(slate)

export type FoundationToken = GrFoundationToken & { value: string }

export function themeSection(section: string): GrRoleToken[] {
  return grRoleTokens.filter(token => token.section === section)
}

export function foundationSection(section: string): FoundationToken[] {
  return grFoundationTokens
    .filter(token => token.section === section)
    .map(token => ({ ...token, value: slate.root[token.name.slice(2)] }))
}

const roleNames = new Set(grRoleTokens.map(token => token.name))

export function hasThemeToken(name: string): boolean {
  return roleNames.has(name)
}

export function foundationValue(name: string): string | undefined {
  return slate.root[name.slice(2)]
}

/**
 * Значение роли в теме с раскрытыми ссылками `var(--gr-x)`. Формулы
 * `color-mix` не вычисляются — для них возвращается `undefined`.
 */
export function resolveColor(name: string, theme: ModeName, depth = 0): string | undefined {
  if (depth > 8)
    return undefined
  const raw = slateModes.get(theme)?.[name.slice(2)] ?? foundationValue(name)
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
