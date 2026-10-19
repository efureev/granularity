import { describe, expect, it } from 'vitest'

import { contrastOf, pairs } from './themes'

/**
 * Граница переключаемого контрола — единственное, по чему его видно.
 *
 * Невыбранный чекбокс рисовался рамкой `--gr-brd` (#e2e8f0) на заливке
 * `--gr-bg`: на белой карточке это 1.2:1, и в матрице настроек пустые коробки
 * пропадали. WCAG 1.4.11 требует 3:1 к соседним цветам — к странице, карточке
 * и приглушённой подложке, на которой контрол стоит в строке таблицы. Что
 * контролы ядра рисуют рамку именно этой ролью, проверяет ядро.
 */
const AA_NON_TEXT = 3
const SURFACES = ['--gr-bg', '--gr-card', '--gr-muted'] as const

describe('граница переключаемого контрола', () => {
  it.each(pairs.map(pair => [pair.label, pair] as const))('`--gr-control-brd` держит 3:1 к странице, карточке и `--gr-muted` (%s)', (_label, pair) => {
    const failures = SURFACES
      .map(surface => ({ surface, ratio: contrastOf('var(--gr-control-brd)', `var(${surface})`, pair) }))
      .filter(entry => entry.ratio < AA_NON_TEXT)
      .map(entry => `${entry.surface}: ${entry.ratio.toFixed(2)}`)

    expect(failures).toEqual([])
  })
})
