import { granularityGlobal, keydown, mockRect, pointer } from '@feugene/granularity/testing'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

import GrChartArea from '../../GrChartArea/GrChartArea.vue'

/**
 * `tooltip: false` гасит только панель.
 *
 * Курсор — это `activeIndex`, и живёт он независимо от того, показана ли
 * панель: пара графиков на одном `v-model:activeIndex` (докa `GrChartLine`,
 * «Курсор и клавиатура работают с одним состоянием») — ровно тот случай, когда
 * у второго графика панель лишняя, а курсор нужен. Картинкой график делает
 * только `interactive: false`.
 */
const series = [
  { id: 'direct', label: 'Прямые', x: [0, 1, 2, 3], y: [10, 40, 20, 50] },
  { id: 'search', label: 'Поиск', x: [0, 1, 2, 3], y: [5, 8, 6, 9] },
]

function factory(props: Record<string, unknown> = {}) {
  const wrapper = mount(GrChartArea, {
    props: { series, tooltip: false, ...props },
    global: granularityGlobal(),
    attachTo: document.body,
  })
  const surface = wrapper.find('[data-gr-chart-surface]')

  if (surface.exists())
    mockRect(surface.element, { left: 0, top: 0, width: 640, height: 256 })

  return wrapper
}

function panelShown(wrapper: ReturnType<typeof factory>): boolean {
  return wrapper.findAll('div').some(node => node.attributes('style')?.includes('position: fixed') && node.isVisible())
}

describe('рама графика: tooltip: false', () => {
  it('наведение двигает курсор и сообщает о нём, но панели нет', async () => {
    const wrapper = factory()

    wrapper.get('[data-gr-chart-surface]').element.dispatchEvent(pointer('pointermove', { clientX: 620, clientY: 100 }))
    await nextTick()

    expect(wrapper.emitted('update:activeIndex')?.at(-1)).toEqual([3])
    expect((wrapper.emitted('pointHover')?.at(-1)?.[0] as { index: number } | null)?.index).toBe(3)
    expect(wrapper.find('[data-gr-chart-active-point]').exists()).toBe(true)
    expect(wrapper.find('[data-gr-chart-crosshair]').exists()).toBe(true)
    expect(panelShown(wrapper)).toBe(false)
  })

  it('курсор, пришедший снаружи, рисует активные марки', async () => {
    const wrapper = factory({ activeIndex: null })

    await wrapper.setProps({ activeIndex: 2 })

    expect(wrapper.findAll('[data-gr-chart-active-point]').length).toBeGreaterThan(0)
    expect(wrapper.find('[data-gr-chart-crosshair]').exists()).toBe(true)
    expect(panelShown(wrapper)).toBe(false)
  })

  it('клавиатура двигает курсор так же, как с панелью', async () => {
    const wrapper = factory()

    keydown(wrapper.get('[data-gr-chart-surface]').element, 'ArrowRight')
    await nextTick()

    expect(wrapper.emitted('update:activeIndex')?.at(-1)).toEqual([0])
    expect(panelShown(wrapper)).toBe(false)
  })

  it('без интерактивности курсора нет вовсе', () => {
    const wrapper = factory({ interactive: false, activeIndex: 1 })

    expect(wrapper.find('[data-gr-chart-surface]').exists()).toBe(false)
  })
})
