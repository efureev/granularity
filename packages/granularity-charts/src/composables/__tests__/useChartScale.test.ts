import { describe, expect, it } from 'vitest'
import { ref } from 'vue'

import { normalizeChartData } from '../../chart/chartModel'
import { useChartScale } from '../useChartScale'

const plot = { x: 40, y: 10, width: 360, height: 200 }

describe('useChartScale', () => {
  it('раскладывает линейные данные по области построения', () => {
    const data = normalizeChartData([{ id: 'a', x: [0, 10], y: [0, 100] }])
    const { xScale, yScale } = useChartScale({ data: () => data, plot: () => plot })

    expect(xScale.value.scale(0)).toBe(40)
    expect(xScale.value.scale(10)).toBe(400)
    expect(yScale.value.kind).toBe('linear')
  })

  it('ось значений перевёрнута: рост идёт вверх', () => {
    const data = normalizeChartData([{ id: 'a', y: [0, 100] }], { yDomain: [0, 100] })
    const { yScale } = useChartScale({ data: () => data, plot: () => plot })

    expect(yScale.value.scale(0)).toBe(210)
    expect(yScale.value.scale(100)).toBe(10)
  })

  it('категориальные данные дают band-шкалу с ненулевой шириной полосы', () => {
    const data = normalizeChartData([{ id: 'a', data: [{ x: 'янв', y: 1 }, { x: 'фев', y: 2 }] }])
    const { xScale } = useChartScale({ data: () => data, plot: () => plot })

    expect(xScale.value.kind).toBe('band')
    expect(xScale.value.bandwidth).toBeGreaterThan(0)
  })

  it('пересчитывается при смене области построения', () => {
    const data = normalizeChartData([{ id: 'a', x: [0, 10], y: [0, 1] }])
    const box = ref({ x: 0, y: 0, width: 100, height: 100 })
    const { xScale } = useChartScale({ data: () => data, plot: () => box.value })

    expect(xScale.value.scale(10)).toBe(100)
    box.value = { x: 0, y: 0, width: 200, height: 100 }
    expect(xScale.value.scale(10)).toBe(200)
  })

  it('готовый «красивый» домен сильнее посчитанного по данным', () => {
    const data = normalizeChartData([{ id: 'a', y: [3, 7] }])
    const { yScale } = useChartScale({ data: () => data, plot: () => plot, yDomain: () => [0, 10] })

    expect(yScale.value.domain).toEqual([0, 10])
  })
})
