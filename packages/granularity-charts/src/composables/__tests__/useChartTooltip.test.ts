import { mockRect } from '@feugene/granularity/testing'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h, ref, shallowRef } from 'vue'

import { type ChartData, normalizeChartData } from '../../chart/chartModel'
import { linearScale } from '../../chart/chartScale'
import { useChartTooltip, type UseChartTooltipReturn } from '../useChartTooltip'

const plot = { x: 0, y: 0, width: 400, height: 200 }

/**
 * Композабл вешает `onBeforeUnmount`, поэтому живёт внутри компонента.
 * Раскладки в jsdom нет — прямоугольник поверхности задаётся `mockRect`.
 */
function setup(data: ChartData, enabled = true) {
  const api = shallowRef<UseChartTooltipReturn>()
  const surface = ref<HTMLElement | null>(null)
  const source = ref(data)

  const wrapper = mount(defineComponent({
    setup() {
      api.value = useChartTooltip({
        data: () => source.value,
        xScale: () => linearScale(source.value.xDomain, [plot.x, plot.x + plot.width]),
        yScale: () => linearScale(source.value.yDomain, [plot.y + plot.height, plot.y]),
        plot: () => plot,
        surface,
        enabled: () => enabled,
        closeDelayMs: 0,
      })

      return () => h('div', { ref: surface })
    },
  }))

  const element = wrapper.element as HTMLElement

  mockRect(element, { left: 0, top: 0, width: 400, height: 200 })
  surface.value = element

  return { api: api.value!, wrapper, source }
}

function pointerAt(clientX: number): PointerEvent {
  return { clientX, clientY: 0 } as PointerEvent
}

describe('useChartTooltip', () => {
  const data = normalizeChartData([{ id: 'a', label: 'Продажи', x: [0, 10, 20], y: [1, 5, 3] }])

  it('находит ближайшую точку по координате указателя, а не по попаданию в марку', () => {
    const { api } = setup(data)

    api.onPointerMove(pointerAt(210))

    expect(api.activeIndex.value).toBe(1)
    expect(api.active.value?.series[0]!.value).toBe(5)
    expect(api.open.value).toBe(true)
  })

  it('за краем холста прижимается к крайней точке', () => {
    const { api } = setup(data)

    api.onPointerMove(pointerAt(-100))
    expect(api.activeIndex.value).toBe(0)

    api.onPointerMove(pointerAt(9999))
    expect(api.activeIndex.value).toBe(2)
  })

  it('собирает значения всех видимых серий на одной позиции', () => {
    const { api } = setup(normalizeChartData([
      { id: 'a', label: 'A', y: [1, 2] },
      { id: 'b', label: 'B', y: [10, 20] },
      { id: 'c', label: 'C', y: [100, 200], hidden: true },
    ]))

    api.setActive(1)

    expect(api.active.value?.series.map(series => [series.label, series.value]))
      .toEqual([['A', 2], ['B', 20]])
  })

  it('пропуск в серии отдаётся как null, а не как ноль', () => {
    const { api } = setup(normalizeChartData([{ id: 'a', x: [0, 1], y: [1, null] }]))

    api.setActive(1)

    expect(api.active.value?.series[0]!.value).toBeNull()
  })

  it('якорь садится на верхнее значение столбика точек', () => {
    const { api } = setup(normalizeChartData([
      { id: 'a', y: [1, 5] },
      { id: 'b', y: [1, 2] },
    ]))

    api.setActive(1)
    const style = api.anchorStyle.value

    expect(style.position).toBe('absolute')
    expect(style.top).toBe('0px')
    expect(style.pointerEvents).toBe('none')
  })

  it('без активной точки якорь спрятан', () => {
    const { api } = setup(data)

    expect(api.anchorStyle.value.display).toBe('none')
  })

  it('выключенный тултип не открывается от движения указателя', () => {
    const { api } = setup(data, false)

    api.onPointerMove(pointerAt(210))

    expect(api.activeIndex.value).toBeNull()
    expect(api.open.value).toBe(false)
  })

  it('смена данных закрывает тултип: прежний индекс адресует чужую точку', async () => {
    const { api, source } = setup(data)

    api.setActive(2)
    expect(api.open.value).toBe(true)

    source.value = normalizeChartData([{ id: 'a', y: [1] }])
    await Promise.resolve()

    expect(api.activeIndex.value).toBeNull()
    expect(api.open.value).toBe(false)
  })

  it('пустой набор не даёт активной точки', () => {
    const { api } = setup(normalizeChartData([]))

    api.onPointerMove(pointerAt(100))

    expect(api.activeIndex.value).toBeNull()
  })
})
