import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'

import { cancelPointer, granularityGlobal, move, press, release, resetGranularityDom } from '@feugene/granularity/testing'
import { nextFrame, stubElementRects } from '@feugene/granularity-test-kit/vue'

import type { GrDashboardResponsiveLayout } from '../../../layout'
import GrDashboard from '../GrDashboard.vue'
import GrDashboardItem from '../../GrDashboardItem/GrDashboardItem.vue'

/**
 * Указательный жест. Метрика снимается на `pointerdown`, поэтому ширина должна
 * держаться всё время теста, а не только на монтировании.
 *
 * 1200px и 12 колонок при зазоре 12 дают шаг колонки 100px — на нём и считаются
 * ожидания ниже.
 */
const WIDTH = 1200
const COL_STEP = 100

let restoreRect: (() => void) | null = null

beforeEach(() => {
  restoreRect = stubElementRects({ width: WIDTH })
})

afterEach(() => {
  restoreRect?.()
  restoreRect = null
  resetGranularityDom()
})

function stand() {
  const layout = ref<GrDashboardResponsiveLayout>({
    lg: [
      { id: 'sales', x: 0, y: 0, w: 4, h: 2 },
      { id: 'traffic', x: 4, y: 0, w: 4, h: 2 },
    ],
  })

  const Stand = defineComponent({
    setup: () => () => h(
      GrDashboard,
      {
        'layout': layout.value,
        'mode': 'edit',
        'onUpdate:layout': (value: GrDashboardResponsiveLayout) => { layout.value = value },
      },
      () => [
        h(GrDashboardItem, { itemId: 'sales', title: 'Продажи' }),
        h(GrDashboardItem, { itemId: 'traffic', title: 'Трафик' }),
      ],
    ),
  })

  const wrapper = mount(Stand, { attachTo: document.body, global: granularityGlobal() })
  const root = wrapper.element as HTMLElement

  return { root, layout }
}

function handle(root: HTMLElement, id: string, kind: 'drag' | 'resize' = 'drag'): HTMLElement {
  const el = root.querySelector<HTMLElement>(`[data-item-id="${id}"] [data-gr-dashboard-${kind}-handle]`)
  if (!el) throw new Error(`нет ручки ${kind} у ${id}`)

  return el
}

function xOf(layout: GrDashboardResponsiveLayout, id: string): number | undefined {
  return layout.lg?.find(item => item.id === id)?.x
}

describe('gRDashboard: перенос указателем', () => {
  it('отпускание коммитит новую ячейку', async () => {
    const { root, layout } = stand()

    press(handle(root, 'sales'), { clientX: 10, clientY: 10 })
    move({ clientX: 10 + COL_STEP * 2, clientY: 10 })
    await nextFrame()
    release()
    await nextTick()

    expect(xOf(layout.value, 'sales')).toBe(2)
  })

  it('обрыв жеста возвращает раскладку к исходной', async () => {
    const { root, layout } = stand()
    const before = JSON.stringify(layout.value)

    press(handle(root, 'sales'), { clientX: 10, clientY: 10 })
    move({ clientX: 10 + COL_STEP * 3, clientY: 10 })
    await nextFrame()
    cancelPointer()
    await nextTick()

    expect(JSON.stringify(layout.value)).toBe(before)
  })

  it('движение и отпускание в одном кадре не теряют последний сдвиг', async () => {
    // Кадр между `move` и `release` намеренно не даётся: именно так выглядит
    // быстрый бросок мышью.
    const { root, layout } = stand()

    press(handle(root, 'sales'), { clientX: 10, clientY: 10 })
    move({ clientX: 10 + COL_STEP * 2, clientY: 10 })
    release()
    await nextTick()

    expect(xOf(layout.value, 'sales')).toBe(2)
  })

  it('движение внутри одной ячейки раскладку не меняет', async () => {
    const { root, layout } = stand()
    const before = JSON.stringify(layout.value)

    press(handle(root, 'sales'), { clientX: 10, clientY: 10 })
    move({ clientX: 10 + COL_STEP * 0.3, clientY: 10 })
    await nextFrame()

    expect(JSON.stringify(layout.value)).toBe(before)

    release()
  })

  it('во время жеста виджет выходит из потока и двигается переменными', async () => {
    const { root } = stand()
    const item = root.querySelector<HTMLElement>('[data-item-id="sales"]')

    press(handle(root, 'sales'), { clientX: 10, clientY: 10 })
    move({ clientX: 10 + COL_STEP, clientY: 10 })
    await nextFrame()
    await nextTick()

    expect(item?.style.position).toBe('absolute')
    expect(item?.style.getPropertyValue('--gr-dashboard-drag-x')).toBe(`${COL_STEP}px`)

    release()
    await nextTick()

    // После жеста виджет возвращается в сетку: следов пиксельной раскладки не остаётся.
    expect(item?.style.position).toBe('')
    expect(item?.style.getPropertyValue('--gr-dashboard-drag-x')).toBe('')
  })

  it('растягивание указателем меняет размер по отпусканию', async () => {
    const { root, layout } = stand()

    press(handle(root, 'sales', 'resize'), { clientX: 400, clientY: 100 })
    move({ clientX: 400 + COL_STEP, clientY: 100 })
    await nextFrame()
    release()
    await nextTick()

    expect(layout.value.lg?.find(item => item.id === 'sales')?.w).toBe(5)
  })

  it('в режиме просмотра жест не начинается', async () => {
    const layout = ref<GrDashboardResponsiveLayout>({ lg: [{ id: 'sales', x: 0, y: 0, w: 4, h: 2 }] })

    const Stand = defineComponent({
      setup: () => () => h(
        GrDashboard,
        { layout: layout.value, mode: 'view' },
        () => [h(GrDashboardItem, { itemId: 'sales', title: 'Продажи' })],
      ),
    })

    const wrapper = mount(Stand, { attachTo: document.body, global: granularityGlobal() })
    const root = wrapper.element as HTMLElement

    expect(root.querySelector('[data-gr-dashboard-drag-handle]')).toBeNull()
  })
})
