import { describe, expect, it } from 'vitest'

import { bandScale, linearScale, timeScale } from '../../chart/chartScale'
import { useChartTicks } from '../useChartTicks'

describe('useChartTicks', () => {
  it('линейная ось: подписи форматируются числом', () => {
    const scale = linearScale([0, 100], [0, 400])
    const ticks = useChartTicks({ scale: () => scale, count: () => 5, locale: () => 'en-US' })

    expect(ticks.value.length).toBeGreaterThan(2)
    expect(ticks.value[0]!.label).toBe('0')
    expect(ticks.value.every(tick => tick.position >= 0)).toBe(true)
  })

  it('координата деления считается той же шкалой, что и точки', () => {
    const scale = linearScale([0, 100], [0, 400])
    const ticks = useChartTicks({ scale: () => scale, count: () => 5 })

    for (const tick of ticks.value)
      expect(tick.position).toBe(scale.scale(tick.value))
  })

  it('категориальная ось берёт подписи из категорий и прореживает их', () => {
    const categories = Array.from({ length: 30 }, (_, i) => `к${i}`)
    const scale = bandScale(categories.length, [0, 600])
    const ticks = useChartTicks({
      scale: () => scale,
      count: () => 6,
      categories: () => categories,
      maxLabels: () => 6,
    })

    expect(ticks.value.length).toBeLessThanOrEqual(7)
    expect(ticks.value[0]!.label).toBe('к0')
    expect(ticks.value[ticks.value.length - 1]!.label).toBe('к29')
  })

  it('ось времени подписывается датами, а не числами', () => {
    const scale = timeScale([new Date(2026, 0, 1).getTime(), new Date(2026, 0, 8).getTime()], [0, 400])
    const ticks = useChartTicks({ scale: () => scale, count: () => 5, locale: () => 'en-US' })

    expect(ticks.value.length).toBeGreaterThan(1)
    expect(ticks.value[0]!.label).not.toMatch(/^\d{10,}$/)
  })

  it('формат потребителя сильнее встроенного', () => {
    const scale = linearScale([0, 10], [0, 100])
    const ticks = useChartTicks({
      scale: () => scale,
      count: () => 3,
      format: () => value => `${value} шт`,
    })

    expect(ticks.value[0]!.label).toBe('0 шт')
  })

  it('пустые категории не роняют ось', () => {
    const ticks = useChartTicks({
      scale: () => bandScale(0, [0, 100]),
      count: () => 5,
      categories: () => [],
    })

    expect(ticks.value).toEqual([])
  })
})
