import { mount } from '@vue/test-utils'
import { defineComponent, nextTick, ref } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useFloating } from '../useFloating'

/**
 * `autoUpdate` подписывается на ResizeObserver/IntersectionObserver и scroll —
 * подписка обязана существовать ровно тогда, когда панель открыта. Мокаем
 * `@floating-ui/dom`, чтобы наблюдать сам факт подписки и её снятие.
 */
const autoUpdateCleanup = vi.fn()
const autoUpdateMock = vi.fn((..._args: unknown[]) => autoUpdateCleanup)

vi.mock('@floating-ui/dom', () => ({
  autoUpdate: (...args: unknown[]) => autoUpdateMock(...args),
  computePosition: vi.fn(() => Promise.resolve({ x: 0, y: 0, placement: 'bottom-start' })),
  flip: vi.fn(() => ({})),
  shift: vi.fn(() => ({})),
  offset: vi.fn(() => ({})),
  size: vi.fn(() => ({})),
}))

function mountHarness() {
  const open = ref(false)

  const wrapper = mount(defineComponent({
    setup() {
      const reference = ref<HTMLElement | null>(null)
      const floating = ref<HTMLElement | null>(null)
      useFloating(reference, floating, open)
      return { reference, floating }
    },
    template: '<div><button ref="reference" /><div ref="floating" /></div>',
  }), { attachTo: document.body })

  return { wrapper, open }
}

describe('useFloating — жизненный цикл autoUpdate', () => {
  beforeEach(() => {
    autoUpdateMock.mockClear()
    autoUpdateCleanup.mockClear()
  })

  it('открытие подписывает, закрытие снимает', async () => {
    const { wrapper, open } = mountHarness()

    open.value = true
    // `start()` отложен на тик после срабатывания watcher-а — ждём оба.
    await nextTick()
    await nextTick()
    expect(autoUpdateMock).toHaveBeenCalledTimes(1)

    open.value = false
    await nextTick()
    expect(autoUpdateCleanup).toHaveBeenCalledTimes(1)

    wrapper.unmount()
  })

  it('закрытие до отложенного start() не оставляет подписку на закрытой панели', async () => {
    const { wrapper, open } = mountHarness()

    // Двойной клик по триггеру: `start()` ещё в очереди nextTick, а панель уже
    // закрыта — `stop()` отработал раньше и снимать ему было нечего.
    open.value = true
    await nextTick()
    open.value = false
    await nextTick()
    await nextTick()

    expect(autoUpdateMock).not.toHaveBeenCalled()

    wrapper.unmount()
  })
})
