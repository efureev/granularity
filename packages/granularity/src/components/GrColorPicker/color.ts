/**
 * Арифметика цвета для `GrColorPicker` — чистый модуль без Vue.
 *
 * Модель компонента — hex-строка (в такой форме цвет лежит в токенах темы),
 * а панель работает в HSL: у оттенка, насыщенности и светлоты есть шкала, по
 * которой можно вести слайдер, а у каналов RGB её нет.
 *
 * Свой парсер, а не `__tests__/cssContrast.ts`: тот — инфраструктура гейтов, и
 * тянуть тестовый модуль в поставляемый код нельзя.
 */

export type GrHsla = {
  /** Оттенок, 0…359 (круговой: 360 — это 0). */
  h: number
  /** Насыщенность, 0…100. */
  s: number
  /** Светлота, 0…100. */
  l: number
  /** Непрозрачность, 0…1. */
  a: number
}

type Rgb = { r: number, g: number, b: number }

const HEX_PATTERN = /^#?([0-9a-f]{3,8})$/i

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Оттенок цикличен: 360° — тот же цвет, что 0°.
 *
 * Округления здесь нет намеренно: `#3b82f6` даёт 217.22°, и округлив его до
 * целого, обратное преобразование вернуло бы `#3b83f6` — компонент молча
 * переписывал бы чужой цвет при первом же открытии панели. Целые градусы
 * появляются там, где они и нужны, — на шкале слайдера (`normalizeHsla`).
 */
function normalizeHue(hue: number): number {
  if (!Number.isFinite(hue)) return 0
  return ((hue % 360) + 360) % 360
}

/** Короткая форма `#abc` разворачивается в `#aabbcc` — так её читает и CSS. */
function expandShorthand(hex: string): string | null {
  if (hex.length === 3 || hex.length === 4)
    return [...hex].map(char => char + char).join('')

  if (hex.length === 6 || hex.length === 8) return hex

  return null
}

function rgbToHsl({ r, g, b }: Rgb): { h: number, s: number, l: number } {
  const red = r / 255
  const green = g / 255
  const blue = b / 255

  const max = Math.max(red, green, blue)
  const min = Math.min(red, green, blue)
  const delta = max - min
  const lightness = (max + min) / 2

  if (delta === 0) return { h: 0, s: 0, l: lightness * 100 }

  const saturation = delta / (1 - Math.abs(2 * lightness - 1))

  let hue: number
  if (max === red) hue = ((green - blue) / delta) % 6
  else if (max === green) hue = (blue - red) / delta + 2
  else hue = (red - green) / delta + 4

  return { h: normalizeHue(hue * 60), s: saturation * 100, l: lightness * 100 }
}

function hslToRgb({ h, s, l }: Omit<GrHsla, 'a'>): Rgb {
  const saturation = clamp(s, 0, 100) / 100
  const lightness = clamp(l, 0, 100) / 100
  const hue = normalizeHue(h)

  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation
  const second = chroma * (1 - Math.abs(((hue / 60) % 2) - 1))
  const match = lightness - chroma / 2

  const [red, green, blue] = ((): [number, number, number] => {
    if (hue < 60) return [chroma, second, 0]
    if (hue < 120) return [second, chroma, 0]
    if (hue < 180) return [0, chroma, second]
    if (hue < 240) return [0, second, chroma]
    if (hue < 300) return [second, 0, chroma]
    return [chroma, 0, second]
  })()

  return {
    r: Math.round((red + match) * 255),
    g: Math.round((green + match) * 255),
    b: Math.round((blue + match) * 255),
  }
}

function toHexPair(value: number): string {
  return clamp(Math.round(value), 0, 255).toString(16).padStart(2, '0')
}

/**
 * Разбирает hex любой из четырёх форм (`#abc`, `#abcd`, `#aabbcc`, `#aabbccdd`),
 * регистр и решётка необязательны.
 *
 * Мусор возвращает `null`, а не бросает: значение приходит из модели снаружи и
 * из поля ввода, и упавший компонент — худший ответ на опечатку.
 */
export function parseHexColor(value: unknown): GrHsla | null {
  if (typeof value !== 'string') return null

  const match = HEX_PATTERN.exec(value.trim())
  if (!match) return null

  const hex = expandShorthand(match[1])
  if (!hex) return null

  const rgb: Rgb = {
    r: Number.parseInt(hex.slice(0, 2), 16),
    g: Number.parseInt(hex.slice(2, 4), 16),
    b: Number.parseInt(hex.slice(4, 6), 16),
  }

  const alpha = hex.length === 8 ? Number.parseInt(hex.slice(6, 8), 16) / 255 : 1

  return { ...rgbToHsl(rgb), a: alpha }
}

/**
 * Собирает hex обратно. `withAlpha: false` альфу отбрасывает, а не округляет до
 * непрозрачного: компонент без пропа `alpha` не вправе отдавать восьмизначную
 * форму, которую потребитель не ждёт.
 */
export function formatHexColor(color: GrHsla, withAlpha = false): string {
  const { r, g, b } = hslToRgb(color)
  const base = `#${toHexPair(r)}${toHexPair(g)}${toHexPair(b)}`

  if (!withAlpha) return base

  return `${base}${toHexPair(clamp(color.a, 0, 1) * 255)}`
}

/** Короткая запись числа: целое остаётся целым, дробь обрезается до сотых. */
function trim(value: number): number {
  return Math.round(value * 100) / 100
}

/** CSS-запись цвета для превью и градиентов. */
export function hslaToCss(color: GrHsla): string {
  const h = trim(normalizeHue(color.h))
  const s = trim(clamp(color.s, 0, 100))
  const l = trim(clamp(color.l, 0, 100))

  return `hsl(${h} ${s}% ${l}% / ${trim(clamp(color.a, 0, 1))})`
}

/** Приводит произвольный объект к валидному диапазону каналов. */
export function normalizeHsla(color: GrHsla): GrHsla {
  return {
    h: Math.round(normalizeHue(color.h)) % 360,
    s: clamp(Math.round(color.s), 0, 100),
    l: clamp(Math.round(color.l), 0, 100),
    a: clamp(color.a, 0, 1),
  }
}
