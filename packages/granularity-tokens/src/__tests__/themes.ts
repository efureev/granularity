import { readdirSync } from 'node:fs'
import { resolve } from 'node:path'

import { grDerivedTokens } from '../generated'
import { contrast, deltaE, mixSrgb, parseHex, type Rgb } from '../theme/color'
import { resolveModes } from '../modes'
import { loadTheme } from '../theme/node'
import type { GrThemeData } from '../types'

/**
 * Темы пакета для гейтов значений: каждая собрана `loadTheme` из `themes/<slug>/`,
 * то есть тем же путём, что тема приложения. Гейты идут по парам «тема × режим»:
 * новая тема или режим попадают под проверки сами.
 */

// Пути — от cwd пакета: в vitest `import.meta.url` не всегда file-scheme.
const themesDir = resolve(process.cwd(), 'themes')

export const themes: GrThemeData[] = readdirSync(themesDir, { withFileTypes: true })
  .filter(entry => entry.isDirectory())
  .map(entry => loadTheme(resolve(themesDir, entry.name)))

export interface ThemePair {
  /** `<тема>-<режим>` — то же значение, что встанет в `data-theme`. */
  label: string
  theme: GrThemeData
  mode: string
  colorScheme: 'light' | 'dark'
  /** Значения корня и режима с полными именами (`--gr-bg`), как их видит каскад. */
  vars: Record<string, string>
}

function withDashes(tokens: Readonly<Record<string, string>>): Record<string, string> {
  return Object.fromEntries(Object.entries(tokens).map(([name, value]) => [`--${name}`, value]))
}

/** Формулы производных — как их объявляет `tokens.css`: под любым режимом одни и те же. */
const derivedFormulas: Record<string, string> = Object.fromEntries(grDerivedTokens.map(token => [token.name, token.formula]))

export const pairs: ThemePair[] = themes.flatMap((theme) => {
  const resolved = resolveModes(theme)

  return Object.entries(theme.modes).map(([mode, data]) => ({
    label: `${theme.id}-${mode}`,
    theme,
    mode,
    colorScheme: data.colorScheme,
    vars: { ...derivedFormulas, ...withDashes(theme.root), ...withDashes(resolved.get(mode)!) },
  }))
})

/** Разбивает по запятым верхнего уровня, не залезая внутрь скобок. */
function splitTopLevel(input: string): string[] {
  const parts: string[] = []
  let buffer = ''
  let depth = 0

  for (const char of input) {
    if (char === ',' && depth === 0) {
      parts.push(buffer.trim())
      buffer = ''
      continue
    }

    if (char === '(')
      depth += 1
    if (char === ')')
      depth -= 1
    buffer += char
  }

  if (buffer.trim())
    parts.push(buffer.trim())

  return parts
}

/** Цвет выражения под парой: `var()` с фолбэком, `color-mix(in srgb, …)`, hex. */
export function colorOf(expression: string, pair: ThemePair, stack: string[] = []): string {
  const value = expression.trim()

  if (value.startsWith('var(')) {
    const [name, fallback] = splitTopLevel(value.slice(4, -1))
    if (stack.includes(name))
      throw new Error(`цикл var(): ${[...stack, name].join(' → ')}`)

    const next = pair.vars[name] ?? fallback
    if (next === undefined)
      throw new Error(`${pair.label}: неизвестный токен ${name}`)

    return colorOf(next, pair, [...stack, name])
  }

  if (value.startsWith('color-mix(')) {
    const [space, left = '', right] = splitTopLevel(value.slice('color-mix('.length, -1))
    const at = left.lastIndexOf(' ')
    const amount = left.slice(at + 1)
    if (space !== 'in srgb' || at === -1 || !/^\d+%$/.test(amount) || right === undefined)
      throw new Error(`неподдержанная формула: ${value}`)

    return mixSrgb(colorOf(left.slice(0, at), pair, stack), colorOf(right, pair, stack), Number.parseInt(amount))
  }

  parseHex(value)
  return value
}

export const rgbOf = (expression: string, pair: ThemePair): Rgb => parseHex(colorOf(expression, pair))

export function contrastOf(foreground: string, background: string, pair: ThemePair): number {
  return contrast(colorOf(foreground, pair), colorOf(background, pair))
}

export function distanceOf(first: string, second: string, pair: ThemePair): number {
  return deltaE(colorOf(first, pair), colorOf(second, pair))
}
