import { describe, expect, it } from 'vitest'

import { activeSymbolMarks, symbolMarks, toPixelPoints, toStackBand } from '../chartMarks'
import { normalizeChartData } from '../chartModel'
import { linearScale } from '../chartScale'

const xScale = linearScale([0, 3], [0, 300])
const yScale = linearScale([0, 100], [100, 0])

function seriesOf(stacked = false) {
  return normalizeChartData(
    [
      { id: 'a', y: [10, 20, null, 40] },
      { id: 'b', y: [5, 5, 5, 5] },
    ],
    { stacked },
  ).series
}

describe('toPixelPoints', () => {
  it('пропуск остаётся пропуском: разрыв ряда решает геометрия, а не перевод в пиксели', () => {
    const points = toPixelPoints(seriesOf()[0]!, xScale, yScale)

    expect(points).toHaveLength(4)
    expect(points[2]!.y).toBeNull()
    expect(points[0]!.y).toBeCloseTo(90, 9)
  })
})

describe('toStackBand', () => {
  it('вне стека полосы нет вовсе', () => {
    const band = toStackBand(seriesOf()[0]!, xScale, yScale)

    expect(band.top.every(point => point.y === null)).toBe(true)
  })

  it('верхняя серия лежит на сумме нижних', () => {
    const [first, second] = seriesOf(true)
    const lower = toStackBand(first!, xScale, yScale)
    const upper = toStackBand(second!, xScale, yScale)

    // Низ верхней полосы совпадает с верхом нижней — иначе между ними была бы щель.
    expect(upper.base[0]!.y).toBe(lower.top[0]!.y)
    // Ось перевёрнута: больше значение — меньше координата.
    expect(upper.top[0]!.y!).toBeLessThan(upper.base[0]!.y!)
  })

  it('пропуск рвёт свою полосу по обеим границам', () => {
    const band = toStackBand(seriesOf(true)[0]!, xScale, yScale)

    expect(band.top[2]!.y).toBeNull()
    expect(band.base[2]!.y).toBeNull()
  })
})

describe('symbolMarks', () => {
  it('марка на каждое непустое значение обеих серий', () => {
    expect(symbolMarks(seriesOf(), xScale, yScale, 6)).toHaveLength(7)
  })

  it('в стеке марка садится на верх полосы, а не на своё значение', () => {
    const series = seriesOf(true)
    const plain = symbolMarks([series[1]!], xScale, yScale, 6)
    const stacked = symbolMarks([series[1]!], xScale, yScale, 6, true)

    expect(stacked[0]!.d).not.toBe(plain[0]!.d)
  })

  it('ключ марки переживает сортировку: он собран из id серии и индекса входа', () => {
    expect(symbolMarks(seriesOf(), xScale, yScale, 6)[0]!.key).toBe('a-0')
  })
})

describe('activeSymbolMarks', () => {
  it('без позиции курсора марок нет', () => {
    expect(activeSymbolMarks(seriesOf(), xScale, yScale, undefined, 6)).toEqual([])
  })

  it('серия без значения в этой позиции марки не даёт', () => {
    const marks = activeSymbolMarks(seriesOf(), xScale, yScale, 2, 6)

    expect(marks.map(mark => mark.key)).toEqual(['active-b'])
  })
})
