import { describe, expect, it } from 'vitest'

import { GR_CHART_SERIES_COLORS, seriesStyle } from '../chart/chartSeriesStyle'

/**
 * Цвет никогда не единственный различитель серии.
 *
 * Глазами это ловится только на конкретных данных и только тем, кто различает
 * цвета: у палитры ядра пять ролей, и шестая серия обязана отличаться от
 * первой чем-то ещё. Периоды трёх различителей для этого разведены — цвет
 * каждую серию, форма каждые пять, штриховка каждые двадцать пять.
 */

const PROBE = 30

describe('различители серий', () => {
  it('палитра — ровно пять ролей ядра и ни одного своего цвета', () => {
    expect(GR_CHART_SERIES_COLORS).toEqual([
      'var(--gr-chart-1)',
      'var(--gr-chart-2)',
      'var(--gr-chart-3)',
      'var(--gr-chart-4)',
      'var(--gr-chart-5)',
    ])
  })

  it('совпал цвет — различается форма', () => {
    const styles = Array.from({ length: PROBE }, (_, index) => seriesStyle(index))
    const collisions: string[] = []

    for (let i = 0; i < styles.length; i++) {
      for (let j = i + 1; j < styles.length; j++) {
        const a = styles[i]!
        const b = styles[j]!

        if (a.color === b.color && a.shape === b.shape && a.dash === b.dash)
          collisions.push(`${i} и ${j}`)
      }
    }

    expect(collisions, 'серии неразличимы').toEqual([])
  })

  it('первые 25 серий различимы даже без цвета', () => {
    // Проверка «для дальтоника»: цвет выкидываем, остаются форма и штриховка.
    const shapes = new Set<string>()

    for (let index = 0; index < 25; index += GR_CHART_SERIES_COLORS.length)
      shapes.add(seriesStyle(index).shape)

    expect(shapes.size).toBe(5)
  })

  it('у любой штриховки, кроме сплошной, есть непустой узор', () => {
    for (let index = 0; index < PROBE * 3; index++) {
      const style = seriesStyle(index)

      if (style.dash === 'none')
        expect(style.dashArray, `серия ${index}`).toBeUndefined()
      else
        expect(style.dashArray, `серия ${index}`).toBeTruthy()
    }
  })
})
