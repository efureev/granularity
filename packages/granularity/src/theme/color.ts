/**
 * Цветовая математика пакета — один источник на всех.
 *
 * Одну и ту же формулу считают три разных потребителя: генератор токенов
 * (фолбэки `@supports not (color-mix)`), композиция тем (`extendTheme`, `tone`)
 * и гейты контраста. Расхождение здесь не абстрактно: фолбэки уже жили
 * отдельной копией из сорока хексов, которые обязаны были совпадать с живым
 * `color-mix` до байта, и не совпадали.
 *
 * Модуль читает и генератор (`scripts/generate-tokens.mjs`, запускается
 * `node --experimental-strip-types`), поэтому синтаксис здесь только стираемый:
 * ни `enum`, ни `namespace`, ни параметров-свойств в конструкторах.
 */

export type Rgb = [number, number, number]

export function parseHex(value: string): Rgb {
  const match = value.trim().match(/^#([\da-f]{3}|[\da-f]{6})$/i)

  if (!match)
    throw new Error(`ожидался hex-цвет, получено: ${value}`)

  const hex = match[1].length === 3
    ? match[1].split('').map(char => char + char).join('')
    : match[1]

  return [0, 2, 4].map(offset => Number.parseInt(hex.slice(offset, offset + 2), 16)) as Rgb
}

export function toHex(channels: Rgb): string {
  return `#${channels
    .map(channel => Math.round(Math.min(255, Math.max(0, channel))).toString(16).padStart(2, '0'))
    .join('')}`
}

/**
 * `color-mix(in srgb, base <amount>%, other)` для непрозрачных цветов — это
 * линейная интерполяция в gamma-кодированном sRGB, то есть ровно то, что делает
 * браузер. Поэтому посчитанный здесь фолбэк совпадает с живым `color-mix`.
 */
export function mixSrgb(baseHex: string, otherHex: string, amount: number): string {
  const base = parseHex(baseHex)
  const other = parseHex(otherHex)
  const ratio = amount / 100

  return toHex(base.map((channel, index) => channel * ratio + other[index] * (1 - ratio)) as Rgb)
}

export function luminance(color: string | Rgb): number {
  const channels = (typeof color === 'string' ? parseHex(color) : color).map((channel) => {
    const normalized = channel / 255

    return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4
  })

  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]
}

/** Отношение контраста по WCAG 2.1: от 1 (одинаковые) до 21 (чёрное на белом). */
export function contrast(foreground: string | Rgb, background: string | Rgb): number {
  const first = luminance(foreground)
  const second = luminance(background)
  const [lighter, darker] = first > second ? [first, second] : [second, first]

  return (lighter + 0.05) / (darker + 0.05)
}

function toLab(color: string | Rgb): [number, number, number] {
  const [red, green, blue] = (typeof color === 'string' ? parseHex(color) : color).map((channel) => {
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
export function deltaE(first: string | Rgb, second: string | Rgb): number {
  const [firstLab, secondLab] = [toLab(first), toLab(second)]

  return Math.hypot(...firstLab.map((value, index) => value - secondLab[index]))
}

/** Цвет — это hex, а не `var()`/`rgb()`: производные и контраст считаются только по нему. */
export function isHex(value: string): boolean {
  return /^#(?:[\da-f]{3}|[\da-f]{6})$/i.test(value.trim())
}
