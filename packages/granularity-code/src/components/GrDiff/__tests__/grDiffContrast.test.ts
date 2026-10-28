import { describe, expect, it } from 'vitest'

import {
  derivedThemeVars,
  getColorClassExpression,
  getContrastRatio,
  resolveColorExpression,
  THEME_MODES,
  themeVarsByName,
} from '../../../__tests__/cssContrast'
import { diffGutterClass, diffRowTone, diffSignTone, diffWordTone } from '../grDiffStyles'

/**
 * Контраст диффа — по образцу палитры блока. Подложки строк и слов, знак «+/−» и
 * цвет текста на подсветке слова — значения темы, и читаться они обязаны в каждой
 * теме каталога: номер строки, знак и изменённое слово стоят именно на заливке,
 * где контраст теряется незаметнее всего. Порог — AA 4.5:1: кегль кода мелкий.
 *
 * `currentColor` у знака и слова — цвет текста строки, то есть цвет кода по
 * умолчанию; хук `--gr-code-block-fg` тема не задаёт, поэтому подставлен его
 * дефолт.
 */
const AA_NORMAL_TEXT = 4.5

function color(expression: string, theme: string) {
  const plain = expression.replace(/currentColor/gi, 'var(--gr-fg)')
  return resolveColorExpression(plain, themeVarsByName[theme]!, derivedThemeVars)
}

function expression(className: string, prefix: 'bg-[' | 'text-['): string {
  const found = getColorClassExpression(className, prefix)
  if (!found)
    throw new Error(`GrDiff: не удалось извлечь ${prefix} из «${className}»`)
  return found
}

/** Значение токена темы — выражение, которое лежит в данных темы, а не имя переменной. */
function token(name: string, theme: string): string {
  const value = themeVarsByName[theme]![name]
  if (value === undefined)
    throw new Error(`GrDiff: у темы ${theme} нет значения ${name}`)
  return value
}

describe.each(THEME_MODES)('GrDiff — контраст, тема %s', (theme) => {
  it.each(['add', 'remove'] as const)('изменённое слово (%s) читается на своей подсветке', (op) => {
    const background = color(expression(diffWordTone[op], 'bg-['), theme)
    const text = color(token(op === 'add' ? '--gr-diff-word-added-fg' : '--gr-diff-word-removed-fg', theme), theme)
    const ratio = getContrastRatio(text, background)

    expect(ratio, `${op}: ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(AA_NORMAL_TEXT)
  })

  it.each(['add', 'remove'] as const)('знак и номер строки (%s) читаются на заливке строки', (op) => {
    const row = color(expression(diffRowTone[op], 'bg-['), theme)
    const sign = getContrastRatio(color(token(op === 'add' ? '--gr-diff-sign-added' : '--gr-diff-sign-removed', theme), theme), row)
    const gutter = getContrastRatio(color(expression(diffGutterClass, 'text-['), theme), row)

    expect(sign, `знак: ${sign.toFixed(2)}:1`).toBeGreaterThanOrEqual(AA_NORMAL_TEXT)
    expect(gutter, `номер строки: ${gutter.toFixed(2)}:1`).toBeGreaterThanOrEqual(AA_NORMAL_TEXT)
    expect(diffSignTone[op]).toContain(op === 'add' ? '--gr-diff-sign-added' : '--gr-diff-sign-removed')
  })
})
