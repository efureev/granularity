import { granularityGlobal } from '@feugene/granularity/testing'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'

import GrChartLine from '../../GrChartLine/GrChartLine.vue'

/**
 * Подсказка графика прячется, пока её якорь вне вида.
 *
 * Курсор бывает поставлен программно — парой на `v-model:activeIndex`, — и
 * якорь уезжает прокруткой, а панель оставалась прижатой к краю вьюпорта поверх
 * чужого содержимого. Сам механизм — `hideWhenDetached` у `useFloating` ядра, и
 * проверен там; здесь — что рама его включает и что панель не показывается до
 * первого расчёта позиции.
 */
const calls: Array<Record<string, unknown>> = []

vi.mock('@feugene/granularity/composables/useFloating', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@feugene/granularity/composables/useFloating')>()

  return {
    ...actual,
    useFloating: (...args: Parameters<typeof actual.useFloating>) => {
      calls.push((args[3] ?? {}) as Record<string, unknown>)

      return actual.useFloating(...args)
    },
  }
})

describe('рама графика: подсказка без якоря в виду', () => {
  it('рама просит прятать подсказку, когда якорь вне вида', () => {
    calls.length = 0
    const wrapper = mount(GrChartLine, {
      props: { series: [{ id: 'a', label: 'A', y: [1, 3, 2] }], activeIndex: 1 },
      global: granularityGlobal(),
      attachTo: document.body,
    })

    expect(calls.some(options => options.hideWhenDetached === true)).toBe(true)
    wrapper.unmount()
  })

  it('до первого расчёта позиции панель спрятана, а не стоит в углу вьюпорта', () => {
    const wrapper = mount(GrChartLine, {
      props: { series: [{ id: 'a', label: 'A', y: [1, 3, 2] }], activeIndex: ref(1).value },
      global: granularityGlobal(),
      attachTo: document.body,
    })
    const panel = wrapper.findAll('div').find(node => node.attributes('style')?.includes('position: fixed'))

    expect(panel?.attributes('style')).toContain('visibility: hidden')
    wrapper.unmount()
  })
})
