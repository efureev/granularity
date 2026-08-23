import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'

import { cancelPointer, granularityGlobal, move, press, release, resetGranularityDom } from '@feugene/granularity/testing'
import { nextFrame, stubElementRects } from '@feugene/granularity-test-kit/vue'

import type { GrDashboardTransfer } from '../../../composables/useDashboardTransfer'
import type { GrDashboardResponsiveLayout } from '../../../layout'
import type { GrDashboardDropEvent } from '../context'
import GrDashboard from '../GrDashboard.vue'
import GrDashboardItem from '../../GrDashboardItem/GrDashboardItem.vue'

/**
 * Перенос виджета между двумя дашбордами.
 *
 * Жест начинается как обычный перенос внутри сетки и **перерастает** в
 * межсеточный, когда указатель уходит за край своей сетки и попадает в чужую.
 * Отсюда предмет проверок: не «виджет уехал», а что просто выход за край
 * переносом не становится, возврат домой сессию сворачивает, а из источника
 * виджет уходит **только** после успешного приземления.
 *
 * Левая сетка — 0…1200 по горизонтали, правая — 1300…2500. Пробел между ними —
 * ничья земля: отпускание там обязано вернуть виджет на место.
 *
 * Ширина не косметическая: ниже 1200 сетка уходит с брейкпоинта `lg`, и
 * коммиты пишутся в другую раскладку, чем читают проверки.
 */
const LEFT = { left: 0, top: 0, width: 1200, height: 400 }
const RIGHT = { left: 1300, top: 0, width: 1200, height: 400 }

/** Точка внутри левой сетки, внутри правой и между ними. */
const HOME = { clientX: 100, clientY: 100 }
const OVER_RIGHT = { clientX: 1500, clientY: 100 }
const NOWHERE = { clientX: 1250, clientY: 100 }

let restoreRect: (() => void) | null = null

/**
 * Стенды размонтируются между тестами обязательно.
 *
 * Реестр приёмников живёт на уровне модуля, а снимается регистрация из
 * `onBeforeUnmount`: оставленный стенд продолжает числиться целью и ловит
 * указатель в следующем тесте — там, где сетка этого теста принимать отказалась.
 */
const mounted: { unmount: () => void }[] = []

beforeEach(() => {
  restoreRect = stubElementRects((element) => {
    const board = element.closest?.('[data-gr-dashboard]')
    if (board?.getAttribute('aria-label') === 'правая')
      return RIGHT
    if (board?.getAttribute('aria-label') === 'левая')
      return LEFT

    return LEFT
  })
})

afterEach(() => {
  cancelPointer()
  for (const wrapper of mounted.splice(0)) wrapper.unmount()
  restoreRect?.()
  restoreRect = null
  resetGranularityDom()
})

interface StandOptions {
  /** Можно ли утащить виджет из левой сетки. */
  transferable?: boolean
  /** Принимает ли правая сетка. */
  droppable?: boolean
  /** Виджет в левой сетке неподвижен. */
  static?: boolean
}

function stand(options: StandOptions = {}) {
  const left = ref<GrDashboardResponsiveLayout>({
    lg: [
      { id: 'sales', x: 0, y: 0, w: 4, h: 2, static: options.static },
      { id: 'traffic', x: 4, y: 0, w: 4, h: 2 },
    ],
  })
  const right = ref<GrDashboardResponsiveLayout>({ lg: [] })

  const drops: GrDashboardDropEvent[] = []
  const transfersOut: [string, GrDashboardTransfer][] = []

  const Stand = defineComponent({
    setup: () => () => h('div', [
      h(
        GrDashboard,
        {
          'layout': left.value,
          'mode': 'edit',
          'ariaLabel': 'левая',
          'transferable': options.transferable,
          'onUpdate:layout': (value: GrDashboardResponsiveLayout) => { left.value = value },
          'onItemTransferOut': (id: string, payload: GrDashboardTransfer) => { transfersOut.push([id, payload]) },
        },
        () => (left.value.lg ?? []).map(item => h(
          GrDashboardItem,
          { key: item.id, itemId: item.id, title: item.id },
          { default: () => 'график' },
        )),
      ),
      h(
        GrDashboard,
        {
          'layout': right.value,
          'mode': 'edit',
          'ariaLabel': 'правая',
          'droppable': options.droppable,
          'onUpdate:layout': (value: GrDashboardResponsiveLayout) => { right.value = value },
          'onItemDrop': (event: GrDashboardDropEvent) => { drops.push(event) },
        },
        () => (right.value.lg ?? []).map(item => h(
          GrDashboardItem,
          { key: item.id, itemId: item.id, title: item.id },
          { default: () => 'график' },
        )),
      ),
    ]),
  })

  const wrapper = mount(Stand, { attachTo: document.body, global: granularityGlobal() })
  mounted.push(wrapper)
  const root = wrapper.element as HTMLElement

  return {
    root,
    wrapper,
    drops,
    transfersOut,
    leftIds: () => (left.value.lg ?? []).map(item => item.id),
    rightIds: () => (right.value.lg ?? []).map(item => item.id),
    carried: () => root.querySelector('[data-gr-dashboard-transfer-ghost]') !== null,
  }
}

/** Ручка переноса виджета в левой сетке. */
function handle(root: HTMLElement, id: string): HTMLElement {
  const el = root.querySelector<HTMLElement>(`[data-item-id="${id}"] [data-gr-dashboard-handle], [data-item-id="${id}"] button`)
  if (!el)
    throw new Error(`нет ручки у «${id}»`)

  return el
}

async function drag(root: HTMLElement, id: string, ...points: { clientX: number, clientY: number }[]) {
  press(handle(root, id), HOME)

  for (const point of points) {
    move(point)
    await nextFrame()
  }

  await nextTick()
}

describe('перенос между дашбордами', () => {
  it('выход за край без чужой сетки переносом не становится', async () => {
    const s = stand()
    await drag(s.root, 'sales', NOWHERE)

    expect(s.carried()).toBe(false)
    expect(s.leftIds()).toContain('sales')

    release()
    await nextTick()

    expect(s.leftIds()).toContain('sales')
    expect(s.transfersOut).toEqual([])
  })

  it('над чужой сеткой виджет уходит из своей раскладки в превью', async () => {
    const s = stand()
    await drag(s.root, 'sales', OVER_RIGHT)

    expect(s.carried()).toBe(true)
  })

  it('успешное отпускание уносит виджет и сообщает об этом', async () => {
    const s = stand()
    await drag(s.root, 'sales', OVER_RIGHT)

    release()
    await nextTick()

    expect(s.leftIds()).toEqual(['traffic'])
    expect(s.transfersOut.map(([id]) => id)).toEqual(['sales'])
    expect(s.drops.map(entry => entry.transfer.id)).toEqual(['sales'])
    expect(s.drops[0]!.transfer.source).toBe('dashboard')
  })

  /** Ничья земля между сетками: приземляться некуда, и виджет обязан вернуться. */
  it('отпускание мимо всех сеток ничего не уносит', async () => {
    const s = stand()
    await drag(s.root, 'sales', OVER_RIGHT, NOWHERE)

    release()
    await nextTick()

    expect(s.leftIds()).toContain('sales')
    expect(s.transfersOut).toEqual([])
    expect(s.drops).toEqual([])
  })

  it('возврат в свою сетку сворачивает сессию и продолжает обычный перенос', async () => {
    const s = stand()
    await drag(s.root, 'sales', OVER_RIGHT, HOME)

    expect(s.carried()).toBe(false)

    release()
    await nextTick()

    expect(s.leftIds()).toContain('sales')
    expect(s.transfersOut).toEqual([])
  })

  it('`transferable: false` виджет не отпускает', async () => {
    const s = stand({ transferable: false })
    await drag(s.root, 'sales', OVER_RIGHT)

    expect(s.carried()).toBe(false)

    release()
    await nextTick()

    expect(s.leftIds()).toContain('sales')
  })

  /** У неподвижного виджета ручки нет вовсе — тащить его не с чего. */
  it('`static` не переносится: ручки у него нет', () => {
    const s = stand({ static: true })

    expect(s.root.querySelector('[data-item-id="sales"] button')).toBeNull()
    expect(s.root.querySelector('[data-item-id="traffic"] button')).not.toBeNull()
  })

  it('непринимающая сетка целью не становится', async () => {
    const s = stand({ droppable: false })
    await drag(s.root, 'sales', OVER_RIGHT)

    expect(s.carried()).toBe(false)

    release()
    await nextTick()

    expect(s.leftIds()).toContain('sales')
  })
})
