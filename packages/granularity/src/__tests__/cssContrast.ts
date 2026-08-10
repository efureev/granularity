import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * Разрешение CSS-цветов и расчёт контраста для тестов.
 *
 * Зачем: jsdom не считает каскад и не умеет `color-mix()`, поэтому проверить
 * «что реально увидит пользователь» через `getComputedStyle` нельзя. Здесь
 * тема читается как файл, `var()`/`color-mix()` разворачиваются вручную, и
 * контраст считается по формуле WCAG. Это позволяет держать AA-гарантию в
 * юнит-тестах, а не только в axe поверх собранной витрины.
 *
 * ВНИМАНИЕ: `parseVars` — намеренно наивный регэксп по всему тексту файла,
 * **включая комментарии**. Поэтому в комментариях внутри `themes/*.css`
 * нельзя писать имя токена с двоеточием сразу после (`--gr-x:`): такая строка
 * будет прочитана как объявление и «съест» следующее до ближайшей `;`.
 */

export type RgbColor = {
  r: number
  g: number
  b: number
}

export function parseVars(content: string): Record<string, string> {
  return Object.fromEntries(
    [...content.matchAll(/--([\w-]+):\s*([^;]+);/g)].map(([, key, value]) => [`--${key}`, value.trim()]),
  )
}

export function extractCssBlock(content: string, selector: string): string {
  const start = content.indexOf(selector)

  if (start === -1) {
    throw new Error(`CSS block not found for selector: ${selector}`)
  }

  const openBrace = content.indexOf('{', start)

  if (openBrace === -1) {
    throw new Error(`CSS block has no opening brace: ${selector}`)
  }

  let depth = 0

  for (let index = openBrace; index < content.length; index += 1) {
    if (content[index] === '{') depth += 1
    if (content[index] === '}') depth -= 1

    if (depth === 0) {
      return content.slice(openBrace + 1, index)
    }
  }

  throw new Error(`CSS block has no closing brace: ${selector}`)
}

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

    if (char === '(') depth += 1
    if (char === ')') depth -= 1
    buffer += char
  }

  if (buffer.trim()) parts.push(buffer.trim())

  return parts
}

function hexToRgb(hex: string): RgbColor {
  let value = hex.trim().slice(1)

  if (value.length === 3) {
    value = value.split('').map(char => char + char).join('')
  }

  const numeric = Number.parseInt(value, 16)

  return {
    r: (numeric >> 16) & 255,
    g: (numeric >> 8) & 255,
    b: numeric & 255,
  }
}

function mixColors(left: RgbColor, right: RgbColor, leftAmount: number): RgbColor {
  return {
    r: left.r * leftAmount + right.r * (1 - leftAmount),
    g: left.g * leftAmount + right.g * (1 - leftAmount),
    b: left.b * leftAmount + right.b * (1 - leftAmount),
  }
}

/**
 * Разворачивает CSS-выражение цвета в RGB: `var()` (с фолбэками и защитой от
 * циклов), `color-mix(in srgb, A p%, B)`, hex и `transparent` (трактуется как
 * фон страницы — под кнопкой/бейджем всегда он).
 */
export function resolveColorExpression(
  expression: string,
  vars: Record<string, string>,
  derivedVars: Record<string, string>,
  stack: string[] = [],
): RgbColor {
  const value = expression.trim()

  if (value === 'transparent') {
    return resolveColorExpression('var(--gr-bg)', vars, derivedVars, stack)
  }

  if (value.startsWith('var(')) {
    const [key, fallback] = splitTopLevel(value.slice(4, -1))

    if (stack.includes(key)) {
      throw new Error(`Circular var() reference: ${[...stack, key].join(' -> ')}`)
    }

    const resolved = vars[key] ?? derivedVars[key] ?? fallback

    if (!resolved) {
      throw new Error(`Unknown CSS var: ${key}`)
    }

    return resolveColorExpression(resolved, vars, derivedVars, [...stack, key])
  }

  if (value.startsWith('color-mix(')) {
    const [space, left, right] = splitTopLevel(value.slice('color-mix('.length, -1))
    const leftMatch = left.match(/^(.+?)\s+(\d+)%$/)

    if (space !== 'in srgb' || !leftMatch) {
      throw new Error(`Unsupported color-mix() expression: ${value}`)
    }

    return mixColors(
      resolveColorExpression(leftMatch[1], vars, derivedVars, stack),
      resolveColorExpression(right, vars, derivedVars, stack),
      Number.parseInt(leftMatch[2], 10) / 100,
    )
  }

  if (value.startsWith('#')) {
    return hexToRgb(value)
  }

  throw new Error(`Unsupported color expression: ${value}`)
}

export function getLuminance(color: RgbColor): number {
  const [red, green, blue] = [color.r, color.g, color.b].map((channel) => {
    const normalized = channel / 255
    return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4
  })

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue
}

export function getContrastRatio(foreground: RgbColor, background: RgbColor): number {
  const first = getLuminance(foreground)
  const second = getLuminance(background)
  const [lighter, darker] = first > second ? [first, second] : [second, first]

  return (lighter + 0.05) / (darker + 0.05)
}

function toLab(color: RgbColor): [number, number, number] {
  const [red, green, blue] = [color.r, color.g, color.b].map((channel) => {
    const normalized = channel / 255
    return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4
  })

  // sRGB → XYZ (D65) → Lab, точки белого из CIE.
  const x = (red * 0.4124 + green * 0.3576 + blue * 0.1805) / 0.95047
  const y = red * 0.2126 + green * 0.7152 + blue * 0.0722
  const z = (red * 0.0193 + green * 0.1192 + blue * 0.9505) / 1.08883

  const f = (value: number): number => (value > 0.008856 ? value ** (1 / 3) : 7.787 * value + 16 / 116)
  const [fx, fy, fz] = [f(x), f(y), f(z)]

  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)]
}

/**
 * Воспринимаемое расстояние между цветами (ΔE, CIE76).
 *
 * Контраст отвечает на вопрос «читается ли текст», а этот — на вопрос
 * «различит ли человек два тона рядом». Порог заметности около 2.3; всё, что
 * ниже, для глаза один цвет, каким бы разным ни выглядел hex.
 */
export function getColorDistance(first: RgbColor, second: RgbColor): number {
  const [firstLab, secondLab] = [toLab(first), toLab(second)]

  return Math.hypot(...firstLab.map((value, index) => value - secondLab[index]))
}

/**
 * Достаёт выражение цвета из utility-класса вида `text-[…]` / `hover:bg-[…]`.
 * `<prefix>transparent` (без скобок) распознаётся отдельно.
 *
 * Подчёркивания разворачиваются обратно в пробелы: в arbitrary-значениях UnoCSS
 * `_` — это escape пробела (`color-mix(in_srgb,var(--gr-x)_30%,…)`). Имена
 * CSS-переменных подчёркиваний не содержат, так что замена безопасна.
 */
export function getColorClassExpression(className: string, prefix: string): string | undefined {
  const transparentToken = `${prefix}transparent`

  if (className.includes(transparentToken)) return 'transparent'

  // `text-[` — префикс не только цвета: кегль из токена приезжает как
  // `text-[length:var(--gr-text-sm)]` и в шкале классов стоит раньше цвета.
  for (let start = className.indexOf(prefix); start !== -1; start = className.indexOf(prefix, start + 1)) {
    const valueStart = start + prefix.length
    const valueEnd = className.indexOf(']', valueStart)

    if (valueEnd === -1) return undefined

    const value = className.slice(valueStart, valueEnd).replace(/_/g, ' ')

    if (!value.startsWith('length:')) return value
  }

  return undefined
}

function readSrc(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), 'utf8')
}

/** Токены глобальных тем + производные из `tokens.css`. */
export const themeVarsByName = {
  light: parseVars(readSrc('src/styles/themes/light.css')),
  dark: parseVars(readSrc('src/styles/themes/dark.css')),
} as const

export const derivedThemeVars = parseVars(readSrc('src/styles/tokens.css'))

export type ThemeName = keyof typeof themeVarsByName

/**
 * Токены компонентной темы (`components/GrX/themes/*.css`). В light-файле
 * блок объявлен на `:root`, в dark — на `.dark,`.
 */
export function readComponentThemeVars(component: string, theme: ThemeName): Record<string, string> {
  const content = readSrc(`src/components/${component}/themes/${theme}.css`)
  return parseVars(extractCssBlock(content, theme === 'light' ? ':root' : '.dark,'))
}
