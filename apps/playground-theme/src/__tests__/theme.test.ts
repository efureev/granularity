import { readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'

import { describe, expect, it } from 'vitest'

import { grThemeTokens } from '@feugene/granularity/tokens'

/**
 * Проверка кастомной темы — ровно та, что описана в
 * `packages/granularity/docs/theming.md`, раздел «Проверка перед выкладкой».
 *
 * Смысл приложения: показать, что тема проверяема автоматически. Полнота
 * набора берётся из данных пакета, контраст считается по WCAG — обе проверки
 * не зависят от того, сколько ролей появится в пакете завтра.
 */

const themeCss = readFileSync(
  fileURLToPath(new URL('../styles/theme-ocean.css', import.meta.url)),
  'utf8',
)

/** Объявления темы: `--gr-x: value;` вне комментариев. */
function parseDeclarations(css: string): Map<string, string> {
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '')

  return new Map(
    [...withoutComments.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)]
      .map(match => [match[1], match[2].trim()]),
  )
}

const declarations = parseDeclarations(themeCss)

// --- контраст (WCAG 2.1) ---------------------------------------------------

function toRgb(hex: string): [number, number, number] {
  const normalized = hex.trim().replace('#', '')
  const full = normalized.length === 3
    ? normalized.split('').map(char => char + char).join('')
    : normalized

  return [0, 2, 4].map(offset => Number.parseInt(full.slice(offset, offset + 2), 16)) as [number, number, number]
}

function relativeLuminance(hex: string): number {
  const channels = toRgb(hex).map((channel) => {
    const value = channel / 255
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  })

  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]
}

function contrast(foreground: string, background: string): number {
  const light = Math.max(relativeLuminance(foreground), relativeLuminance(background))
  const dark = Math.min(relativeLuminance(foreground), relativeLuminance(background))

  return (light + 0.05) / (dark + 0.05)
}

function value(token: string): string {
  const declared = declarations.get(token)
  if (!declared)
    throw new Error(`тема не объявляет ${token}`)

  return declared
}

/**
 * Производные состояния тема не объявляет — их считает пакет формулой
 * `color-mix(in srgb, <роль> N%, --gr-fg)`. Повторяем формулу, чтобы проверить
 * контраст в hover/active: именно там `-fg` чаще всего и проваливается
 * (ловушка №2 из docs/theming.md).
 */
function mixWithFg(role: string, amount: number): string {
  const base = toRgb(value(role))
  const fg = toRgb(value('--gr-fg'))
  const ratio = amount / 100

  return `#${base
    .map((channel, index) => Math.round(channel * ratio + fg[index] * (1 - ratio)).toString(16).padStart(2, '0'))
    .join('')}`
}

const TONES = ['success', 'warning', 'danger', 'info', 'slate', 'azure'] as const
const AA_TEXT = 4.5
const AA_LARGE = 3

describe('тема ocean', () => {
  it('объявляет все роли, которые ожидает пакет', () => {
    const missing = grThemeTokens
      .map(token => token.name)
      .filter(name => !declarations.has(name))

    expect(missing, 'пропущенная роль унаследуется из :root, то есть из светлой темы').toEqual([])
  })

  it('не объявляет лишнего: ни примитивов, ни производных состояний', () => {
    // Покомпонентные токены (`--gr-button-*`) — легитимное исключение: пакет
    // держит для них собственный theme-слой.
    const known = new Set(grThemeTokens.map(token => token.name))

    const extra = [...declarations.keys()]
      .filter(name => !known.has(name) && !name.startsWith('--gr-button-'))

    expect(extra, 'примитивы и hover/active темой не переопределяются').toEqual([])
  })

  it('основной текст проходит AA на всех поверхностях', () => {
    for (const surface of ['--gr-bg', '--gr-card', '--gr-popover', '--gr-sidebar'])
      expect(contrast(value('--gr-fg'), value(surface)), surface).toBeGreaterThanOrEqual(AA_TEXT)
  })

  it('вторичный текст проходит AA на всех своих подложках', () => {
    // Ловушка №1: `--gr-muted-fg` живёт не на фоне страницы.
    for (const surface of ['--gr-bg', '--gr-card', '--gr-muted', '--gr-secondary'])
      expect(contrast(value('--gr-muted-fg'), value(surface)), surface).toBeGreaterThanOrEqual(AA_TEXT)
  })

  it('`-fg` читается на своей заливке — включая hover и active', () => {
    const fills = ['--gr-primary', ...TONES.map(tone => `--gr-${tone}`)]

    for (const fill of fills) {
      const fg = value(`${fill}-fg`)

      expect(contrast(fg, value(fill)), `${fill} (база)`).toBeGreaterThanOrEqual(AA_TEXT)
      expect(contrast(fg, mixWithFg(fill, 92)), `${fill} (hover)`).toBeGreaterThanOrEqual(AA_TEXT)
      expect(contrast(fg, mixWithFg(fill, 84)), `${fill} (active)`).toBeGreaterThanOrEqual(AA_TEXT)
    }
  })

  it('`-text` читается на мягкой подложке и на фоне страницы', () => {
    for (const tone of TONES) {
      const text = value(`--gr-${tone}-text`)

      expect(contrast(text, value(`--gr-${tone}-light`)), `${tone} на -light`).toBeGreaterThanOrEqual(AA_TEXT)
      expect(contrast(text, value('--gr-bg')), `${tone} на фоне`).toBeGreaterThanOrEqual(AA_TEXT)
      expect(contrast(text, value('--gr-card')), `${tone} на карточке`).toBeGreaterThanOrEqual(AA_TEXT)
    }
  })

  it('заливка тоном различима как индикатор', () => {
    // Насыщенный тон — это фон и граница, а не текст: с него хватает 3:1.
    for (const tone of TONES)
      expect(contrast(value(`--gr-${tone}`), value('--gr-bg')), tone).toBeGreaterThanOrEqual(AA_LARGE)
  })

  it('focus-ring виден на всех поверхностях', () => {
    for (const surface of ['--gr-bg', '--gr-card', '--gr-muted'])
      expect(contrast(value('--gr-ring'), value(surface)), surface).toBeGreaterThanOrEqual(AA_LARGE)
  })

  it('primary и info различимы между собой', () => {
    // Ловушка №5: два близких тона делают solid-бейджи Primary и Info неотличимыми.
    const [pr, pg, pb] = toRgb(value('--gr-primary'))
    const [ir, ig, ib] = toRgb(value('--gr-info'))
    const distance = Math.sqrt((pr - ir) ** 2 + (pg - ig) ** 2 + (pb - ib) ** 2)

    expect(distance).toBeGreaterThan(40)
  })
})
