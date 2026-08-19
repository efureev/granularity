import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'

import { cancelPointer, move, release, resetGranularityDom } from '@feugene/granularity/testing'

import type {
  GrDashboardTransfer,
  GrDashboardTransferTarget,
  UseDashboardTransferReturn,
} from '../useDashboardTransfer'
import { GR_DASHBOARD_TRANSFER_THRESHOLD, useDashboardTransfer } from '../useDashboardTransfer'

/**
 * Модель живёт на уровне модуля, поэтому её состояние переживает тест. Обрыв в
 * `afterEach` — не уборка ради уборки: подвисшая сессия молча отменила бы
 * следующий `start`.
 */
afterEach(() => {
  cancelPointer()
  resetGranularityDom()
})

const CARGO: GrDashboardTransfer = { id: 'sales', title: 'Продажи', size: { w: 6, h: 2 }, source: 'palette' }

/** Композабл требует области компонента: внутри он вешает `onScopeDispose`. */
function host() {
  let api: UseDashboardTransferReturn | null = null

  const Host = defineComponent({
    setup: () => {
      api = useDashboardTransfer()

      return () => null
    },
  })

  const wrapper = mount(Host)

  return { wrapper, api: api! }
}

function makeTarget(rect: Partial<DOMRect> & { left: number, top: number, width: number, height: number }, enabled = true) {
  const calls = { over: 0, leave: 0, drop: 0 }
  let lastPoint: { x: number, y: number } | null = null

  const target: GrDashboardTransferTarget = {
    rect: () => new DOMRect(rect.left, rect.top, rect.width, rect.height),
    enabled: () => enabled,
    over: (_transfer, point) => {
      calls.over += 1
      lastPoint = { ...point }
    },
    leave: () => { calls.leave += 1 },
    drop: () => { calls.drop += 1 },
  }

  return { target, calls, point: () => lastPoint }
}

/** Кадр `requestAnimationFrame`: в нём живёт вся работа модели. */
async function frame(): Promise<void> {
  return new Promise(resolve => requestAnimationFrame(() => resolve()))
}

/** `PointerEvent` в jsdom нет — жест собирается `MouseEvent`-ом, как и в `testing/pointer`. */
function pointerdown(x: number, y: number): PointerEvent {
  return new MouseEvent('pointerdown', { button: 0, clientX: x, clientY: y }) as unknown as PointerEvent
}

describe('useDashboardTransfer: порог', () => {
  it('сдвиг меньше порога сессию не начинает: это ещё нажатие', async () => {
    const { api } = host()

    api.start(CARGO, pointerdown(100, 100))
    move({ clientX: 100 + GR_DASHBOARD_TRANSFER_THRESHOLD - 1, clientY: 100 })
    await frame()

    expect(api.transfer.value).toBeNull()
    expect(api.isTransferring.value).toBe(false)
  })

  it('сдвиг больше порога начинает перенос и двигает точку', async () => {
    const { api } = host()

    api.start(CARGO, pointerdown(100, 100))
    move({ clientX: 140, clientY: 160 })
    await frame()

    expect(api.transfer.value).toEqual(CARGO)
    expect(api.point.value).toEqual({ x: 140, y: 160 })
  })

  it('правая кнопка перенос не начинает', () => {
    const { api } = host()

    api.start(CARGO, new MouseEvent('pointerdown', { button: 2, clientX: 0, clientY: 0 }) as unknown as PointerEvent)
    move({ clientX: 100, clientY: 100 })

    expect(api.transfer.value).toBeNull()
  })

  it('палец перенос не начинает: каталог им прокручивают', () => {
    const { api } = host()
    const event = new MouseEvent('pointerdown', { button: 0, clientX: 0, clientY: 0 })
    Object.defineProperty(event, 'pointerType', { value: 'touch' })

    api.start(CARGO, event as unknown as PointerEvent)
    move({ clientX: 100, clientY: 100 })

    expect(api.transfer.value).toBeNull()
  })
})

describe('useDashboardTransfer: приёмники', () => {
  function begin(api: UseDashboardTransferReturn, x = 0, y = 0): void {
    api.start(CARGO, pointerdown(x, y))
  }

  it('цель под точкой получает over, ушедшая из-под неё — leave', async () => {
    const { api } = host()
    const grid = makeTarget({ left: 0, top: 0, width: 200, height: 200 })
    api.registerTarget(grid.target)

    begin(api)
    move({ clientX: 100, clientY: 100 })
    await frame()
    expect(grid.calls.over).toBe(1)
    expect(grid.point()).toEqual({ x: 100, y: 100 })

    move({ clientX: 500, clientY: 500 })
    await frame()
    expect(grid.calls.leave).toBe(1)
  })

  it('из двух целей выбирается та, что под точкой', async () => {
    const { api } = host()
    const left = makeTarget({ left: 0, top: 0, width: 100, height: 100 })
    const right = makeTarget({ left: 200, top: 0, width: 100, height: 100 })
    api.registerTarget(left.target)
    api.registerTarget(right.target)

    begin(api)
    move({ clientX: 50, clientY: 50 })
    await frame()
    expect(left.calls.over).toBe(1)
    expect(right.calls.over).toBe(0)

    move({ clientX: 250, clientY: 50 })
    await frame()
    expect(left.calls.leave).toBe(1)
    expect(right.calls.over).toBe(1)
  })

  it('выключенная цель пропускается', async () => {
    const { api } = host()
    const off = makeTarget({ left: 0, top: 0, width: 200, height: 200 }, false)
    api.registerTarget(off.target)

    begin(api)
    move({ clientX: 100, clientY: 100 })
    await frame()

    expect(off.calls.over).toBe(0)
  })

  it('отпускание над целью роняет виджет ей, а мимо целей — никому', async () => {
    const { api } = host()
    const grid = makeTarget({ left: 0, top: 0, width: 200, height: 200 })
    api.registerTarget(grid.target)

    begin(api)
    move({ clientX: 100, clientY: 100 })
    await frame()
    release()
    expect(grid.calls.drop).toBe(1)
    expect(api.transfer.value).toBeNull()

    begin(api)
    move({ clientX: 900, clientY: 900 })
    await frame()
    expect(() => release()).not.toThrow()
    expect(grid.calls.drop).toBe(1)
  })

  it('Esc и обрыв указателя отменяют перенос без броска', async () => {
    const { api } = host()
    const grid = makeTarget({ left: 0, top: 0, width: 200, height: 200 })
    api.registerTarget(grid.target)

    begin(api)
    move({ clientX: 100, clientY: 100 })
    await frame()
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    expect(grid.calls.drop).toBe(0)
    expect(api.transfer.value).toBeNull()

    begin(api)
    move({ clientX: 100, clientY: 100 })
    await frame()
    cancelPointer()
    expect(grid.calls.drop).toBe(0)
    expect(api.transfer.value).toBeNull()
  })

  it('снятая посреди переноса цель не роняет кадр', async () => {
    const { api } = host()
    const grid = makeTarget({ left: 0, top: 0, width: 200, height: 200 })
    const unregister = api.registerTarget(grid.target)

    begin(api)
    move({ clientX: 100, clientY: 100 })
    await frame()
    unregister()
    move({ clientX: 120, clientY: 120 })

    await expect(frame()).resolves.toBeUndefined()
    expect(() => release()).not.toThrow()
  })

  it('размонтирование источника гасит сессию', async () => {
    const { wrapper, api } = host()
    const grid = makeTarget({ left: 0, top: 0, width: 200, height: 200 })
    api.registerTarget(grid.target)

    begin(api)
    move({ clientX: 100, clientY: 100 })
    await frame()
    expect(api.transfer.value).not.toBeNull()

    // Примитив при смерти области снимает слушатели, но `onCancel` не зовёт:
    // без своей уборки сессия осталась бы висеть навсегда.
    wrapper.unmount()

    expect(api.transfer.value).toBeNull()
    expect(grid.calls.leave).toBe(1)
  })

  it('перенос не начинается поверх уже идущего', () => {
    const { api } = host()

    begin(api, 10, 10)
    move({ clientX: 100, clientY: 100 })
    api.start({ ...CARGO, id: 'other' }, pointerdown(0, 0))

    expect(api.transfer.value?.id).toBe('sales')
  })
})
