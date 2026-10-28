import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import type { GrChartSeriesStyle } from '../chart/chartSeriesStyle'
import { bulletTargetStroke, bulletValueFill } from '../components/GrChartBullet/grChartBulletStyles'
import { brushFill, brushStroke, crosshairStroke, frameTooltipClass, referenceStroke } from '../components/GrChartFrame/chartFrameStyles'
import ChartTooltip from '../components/GrChartFrame/shared/ChartTooltip.vue'
import { waterfallTotalFill } from '../components/GrChartWaterfall/grChartWaterfallStyles'
import { sparklineStroke } from '../components/GrSparkline/grSparklineStyles'

/**
 * Оформление вокруг данных решает тема: подсказка («Глина» — графитовый пузырь,
 * как подсказка ядра), курсор, кисть и опорная линия, значение и цель bullet,
 * итог waterfall, линия спарклайна. Значения сверяет гейт тем каталога; здесь —
 * что компонент читает токен, без запасного значения.
 */
describe('графики — вид у темы', () => {
  it('подсказка: фон, текст, рамка и тень — токены рамки графика', () => {
    for (const token of ['tooltip-bg', 'tooltip-fg', 'tooltip-brd', 'tooltip-shadow'])
      expect(frameTooltipClass).toContain(`var(--gr-chart-frame-${token})`)
    expect(frameTooltipClass).not.toContain('shadow-lg')
  })

  it('метка серии в подсказке обведена кольцом цвета текста пузыря', () => {
    const style = { color: 'var(--gr-chart-1)', shape: 'circle' } as unknown as GrChartSeriesStyle
    const wrapper = mount(ChartTooltip, {
      props: {
        active: { index: 0, x: 0, raw: 'Янв', series: [{ id: 'a', label: 'Выручка', value: 1, point: null, style, axis: 'left' }] },
        title: 'Янв',
        formatValue: (value: number | null) => String(value),
      },
    })
    const swatch = wrapper.get('[data-gr-chart-tooltip] path')

    expect(swatch.attributes('fill')).toBe('var(--gr-chart-1)')
    expect(swatch.attributes('stroke')).toBe('var(--gr-chart-frame-tooltip-swatch-ring)')
  })

  it.each([
    ['курсор', crosshairStroke, '--gr-chart-frame-crosshair'],
    ['заливка кисти', brushFill, '--gr-chart-frame-brush-fill'],
    ['край кисти', brushStroke, '--gr-chart-frame-brush-stroke'],
    ['опорная линия', referenceStroke, '--gr-chart-frame-reference'],
    ['значение bullet', bulletValueFill, '--gr-chart-bullet-value'],
    ['цель bullet', bulletTargetStroke, '--gr-chart-bullet-target'],
    ['итог waterfall', waterfallTotalFill, '--gr-chart-waterfall-total'],
    ['линия спарклайна', sparklineStroke, '--gr-sparkline-color'],
  ])('%s — токен темы без запасного значения', (_name, value, token) => {
    expect(value).toBe(`var(${token})`)
  })
})
