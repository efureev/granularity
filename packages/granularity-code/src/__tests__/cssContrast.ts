import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join } from 'node:path'
import process from 'node:process'

import { grDerivedTokens, grThemeCatalog, resolveModes, type GrThemeData } from '@feugene/granularity-tokens'
import { contrast, deltaE } from '@feugene/granularity-tokens/theme'

/**
 * Разрешение CSS-цветов и расчёт контраста для тестов пакета.
 *
 * Зачем вообще: jsdom не считает каскад и не умеет `color-mix()`, поэтому
 * проверить «что реально увидит пользователь» через `getComputedStyle` нельзя.
 * Тема читается данными, `var()`/`color-mix()` разворачиваются вручную, контраст
 * считается по формуле WCAG.
 *
 * **Про копию.** У ядра есть свой `src/__tests__/cssContrast.ts` — он не
 * публикуется, и спутнику недоступен. Скопирован отсюда только разбор
 * выражений; сама цветовая математика (`contrast`, `deltaE`) берётся из
 * публичного `@feugene/granularity-tokens/theme`, поэтому расходиться в числах гейтам
 * ядра и пакета неоткуда.
 *
 * Правильное место для этого модуля — `granularity-test-kit`: контраст палитры
 * понадобится каждому спутнику, который заведёт свою. Вынос отложен намеренно —
 * он трогает три пакета и не должен ехать внутри заведения нового.
 */

export interface RgbColor { r: number, g: number, b: number }

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

/** Hex в тройку каналов. Поддержаны `#rgb` и `#rrggbb` — других в темах нет. */
function hexToRgb(hex: string): RgbColor {
  const value = hex.trim().slice(1)
  const full = value.length === 3 ? value.split('').map(char => char + char).join('') : value

  if (full.length !== 6)
    throw new Error(`Unsupported hex color: ${hex}`)

  return {
    r: Number.parseInt(full.slice(0, 2), 16),
    g: Number.parseInt(full.slice(2, 4), 16),
    b: Number.parseInt(full.slice(4, 6), 16),
  }
}

function mixColors(left: RgbColor, right: RgbColor, leftAmount: number): RgbColor {
  return {
    r: left.r * leftAmount + right.r * (1 - leftAmount),
    g: left.g * leftAmount + right.g * (1 - leftAmount),
    b: left.b * leftAmount + right.b * (1 - leftAmount),
  }
}

const channelsOf = (color: RgbColor): [number, number, number] => [color.r, color.g, color.b]

export function getContrastRatio(foreground: RgbColor, background: RgbColor): number {
  return contrast(channelsOf(foreground), channelsOf(background))
}

export function getColorDistance(first: RgbColor, second: RgbColor): number {
  return deltaE(channelsOf(first), channelsOf(second))
}

/**
 * Разворачивает CSS-выражение цвета в RGB: `var()` (с фолбэками и защитой от
 * циклов), `color-mix(in srgb, A p%, B)`, hex и `transparent` (трактуется как
 * фон страницы — под блоком кода всегда он).
 */
export function resolveColorExpression(
  expression: string,
  vars: Record<string, string>,
  derivedVars: Record<string, string>,
  stack: string[] = [],
): RgbColor {
  const value = expression.trim()

  if (value === 'transparent')
    return resolveColorExpression('var(--gr-bg)', vars, derivedVars, stack)

  if (value.startsWith('var(')) {
    const [key, fallback] = splitTopLevel(value.slice(4, -1))

    if (key === undefined)
      throw new Error(`Empty var() expression: ${value}`)

    if (stack.includes(key))
      throw new Error(`Circular var() reference: ${[...stack, key].join(' -> ')}`)

    const resolved = vars[key] ?? derivedVars[key] ?? fallback

    if (!resolved)
      throw new Error(`Unknown CSS var: ${key}`)

    return resolveColorExpression(resolved, vars, derivedVars, [...stack, key])
  }

  if (value.startsWith('color-mix(')) {
    const [space, left, right] = splitTopLevel(value.slice('color-mix('.length, -1))
    const leftMatch = left === undefined ? null : /^(.*\S)\s+(\d+)%$/.exec(left)

    if (space !== 'in srgb' || !leftMatch || right === undefined)
      throw new Error(`Unsupported color-mix() expression: ${value}`)

    return mixColors(
      resolveColorExpression(leftMatch[1]!, vars, derivedVars, stack),
      resolveColorExpression(right, vars, derivedVars, stack),
      Number.parseInt(leftMatch[2]!, 10) / 100,
    )
  }

  if (value.startsWith('#'))
    return hexToRgb(value)

  throw new Error(`Unsupported color expression: ${value}`)
}

/**
 * Достаёт выражение цвета из utility-класса вида `text-[…]`.
 *
 * Подчёркивания разворачиваются обратно в пробелы: в arbitrary-значениях UnoCSS
 * `_` — это escape пробела. Имена CSS-переменных подчёркиваний не содержат.
 */
export function getColorClassExpression(className: string, prefix: string): string | undefined {
  if (className.includes(`${prefix}transparent`))
    return 'transparent'

  // `text-[` — префикс не только цвета: кегль приезжает как
  // `text-[length:var(--gr-text-sm)]` и стоит в шкале классов раньше.
  for (let start = className.indexOf(prefix); start !== -1; start = className.indexOf(prefix, start + 1)) {
    const valueStart = start + prefix.length
    const valueEnd = className.indexOf(']', valueStart)

    if (valueEnd === -1)
      return undefined

    const value = className.slice(valueStart, valueEnd).replace(/_/g, ' ')

    if (!value.startsWith('length:'))
      return value
  }

  return undefined
}

type TokenMap = Record<string, string>

function withDashes(tokens: Readonly<TokenMap> | undefined): TokenMap {
  return Object.fromEntries(Object.entries(tokens ?? {}).map(([name, value]) => [`--${name}`, value]))
}

// В jsdom `import.meta.url` не file-scheme — данные тем ищутся от cwd пакета.
const requireFromPackage = createRequire(join(process.cwd(), 'package.json'))

function themeData(theme: string): GrThemeData {
  return JSON.parse(readFileSync(requireFromPackage.resolve(`@feugene/granularity-tokens/themes/${theme}/theme.json`), 'utf8')) as GrThemeData
}

/**
 * Примитивы и роли каждой темы каталога в каждом её режиме — из данных пакета
 * токенов, которые отгружаются. Ключ — пара `<тема>-<режим>`: набор держит
 * каталог, а не тест.
 */
export const themeVarsByName: Readonly<Record<string, TokenMap>> = Object.fromEntries(grThemeCatalog.flatMap((entry) => {
  const data = themeData(entry.id)
  const modes = resolveModes(data)

  return entry.modes.map(mode => [`${entry.id}-${mode.name}`, { ...withDashes(data.root), ...withDashes(modes.get(mode.name)) }])
}))

/** Производные формулы (`--gr-primary-hover` и т.п.) — из реестра пакета токенов. */
export const derivedThemeVars: TokenMap = Object.fromEntries(grDerivedTokens.map(token => [token.name, token.formula]))

export type ThemeName = string

/** Контексты гейтов — пары `<тема>-<режим>` всех тем каталога. */
export const THEME_MODES: readonly ThemeName[] = Object.keys(themeVarsByName)
