import { granularityGlobal } from '@feugene/granularity/testing'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import type { Component } from 'vue'

import GrChartArea from '../../GrChartArea/GrChartArea.vue'
import GrChartBar from '../../GrChartBar/GrChartBar.vue'
import GrChartBullet from '../../GrChartBullet/GrChartBullet.vue'
import GrChartFunnel from '../../GrChartFunnel/GrChartFunnel.vue'
import GrChartHeatmap from '../../GrChartHeatmap/GrChartHeatmap.vue'
import GrChartLine from '../../GrChartLine/GrChartLine.vue'
import GrChartPie from '../../GrChartPie/GrChartPie.vue'
import GrChartRadar from '../../GrChartRadar/GrChartRadar.vue'
import GrChartWaterfall from '../../GrChartWaterfall/GrChartWaterfall.vue'

/**
 * Данные, загрузка и пустота занимают одну высоту области построения.
 *
 * Карточка с графиком, у которого выбрали период без данных, не должна
 * прыгать: скелет загрузки высоту держал всегда, а пустое состояние сжималось
 * до заглушки, и страница под графиком подъезжала вверх.
 *
 * jsdom не вычисляет `min()` и `var()`, поэтому стиль разворачивается здесь:
 * хук пустой высоты не задан — значит, работает его запасное значение.
 */
const HEIGHT = 260
const ROOT_FONT_PX = 16

const xy = [
  { id: 'direct', label: 'Прямые', x: [0, 1, 2, 3], y: [10, 40, 20, 50] },
  { id: 'search', label: 'Поиск', x: [0, 1, 2, 3], y: [5, 8, 6, 9] },
]
const radarAxes = ['Скорость', 'Цена', 'Поддержка']

const charts: Array<{ name: string, component: Component, data: Record<string, unknown>, none: Record<string, unknown> }> = [
  { name: 'GrChartArea', component: GrChartArea, data: { series: xy }, none: { series: [] } },
  { name: 'GrChartLine', component: GrChartLine, data: { series: xy }, none: { series: [] } },
  { name: 'GrChartBar', component: GrChartBar, data: { series: xy }, none: { series: [] } },
  {
    name: 'GrChartPie',
    component: GrChartPie,
    data: { data: [{ label: 'Chrome', value: 60 }, { label: 'Safari', value: 40 }] },
    none: { data: [] },
  },
  {
    name: 'GrChartRadar',
    component: GrChartRadar,
    data: { series: [{ id: 'us', label: 'Мы', x: radarAxes, y: [8, 6, 9] }] },
    none: { series: [] },
  },
  {
    name: 'GrChartFunnel',
    component: GrChartFunnel,
    data: { stages: [{ label: 'Пришли', value: 1000 }, { label: 'Купили', value: 120 }] },
    none: { stages: [] },
  },
  {
    name: 'GrChartHeatmap',
    component: GrChartHeatmap,
    data: { values: [[100, 62], [100, 58]], xLabels: ['M0', 'M1'], yLabels: ['Январь', 'Февраль'] },
    none: { values: [], xLabels: [], yLabels: [] },
  },
  {
    name: 'GrChartWaterfall',
    component: GrChartWaterfall,
    data: { steps: [{ label: 'На начало', value: 500, kind: 'total' }, { label: 'Новые', value: 120 }] },
    none: { steps: [] },
  },
  {
    name: 'GrChartBullet',
    component: GrChartBullet,
    data: { value: 0.031, target: 0.04, ranges: [0.03, 0.035], max: 0.05, label: 'Себестоимость' },
    none: { value: 0.031, empty: true, label: 'Себестоимость' },
  },
]

/** Каждый график типизирован своими пропами; тесту нужны только поиск и текст. */
interface Rendered {
  get: (selector: string) => { attributes: (name: string) => string | undefined }
  text: () => string
}

/** Высота области построения, какой её увидит браузер без хука пустой высоты. */
function plotHeight(wrapper: Rendered): number {
  const style = wrapper.get('[data-gr-chart-plot]').attributes('style') ?? ''
  const value = style.match(/height:([^;]+);/)?.[1]?.trim()

  if (!value)
    throw new Error(`нет высоты в стиле области построения: "${style}"`)

  const withoutHooks = value.replace(/var\(--[\w-]+,([^()]+)\)/g, '$1')
  const lengths = [...withoutHooks.matchAll(/(\d+(?:\.\d+)?)(px|rem)/g)]
    .map(([, number, unit]) => Number(number) * (unit === 'rem' ? ROOT_FONT_PX : 1))

  if (lengths.length === 0)
    throw new Error(`высота не сводится к длинам: "${value}"`)

  return Math.min(...lengths)
}

function render(component: Component, props: Record<string, unknown>): Rendered {
  return mount(component, {
    props: { height: HEIGHT, ...props },
    global: granularityGlobal(),
    attachTo: document.body,
  }) as Rendered
}

describe('рама графика: высота не зависит от состояния', () => {
  it.each(charts)('$name: данные, загрузка и пустота — одна `height`', ({ component, data, none }) => {
    const filled = render(component, data)
    const loading = render(component, { ...none, loading: true })
    const empty = render(component, none)
    const emptyFlag = render(component, { ...data, empty: true })

    expect(plotHeight(filled)).toBe(HEIGHT)
    expect(plotHeight(loading)).toBe(HEIGHT)
    expect(empty.text()).toContain('No data')
    expect(plotHeight(empty)).toBe(HEIGHT)
    expect(plotHeight(emptyFlag)).toBe(HEIGHT)
  })

  it('хук пустой высоты сжимает заглушку, но не поднимает её выше `height`', () => {
    const style = render(GrChartArea, { series: [] }).get('[data-gr-chart-plot]').attributes('style')

    expect(style).toBe(`height: min(${HEIGHT}px, var(--gr-chart-frame-empty-height, ${HEIGHT}px));`)
  })
})
