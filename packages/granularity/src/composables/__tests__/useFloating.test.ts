import { mount } from '@vue/test-utils'
import type { Ref } from 'vue'
import { defineComponent, nextTick, ref, watchEffect } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { pushOverlayLayer, removeOverlayLayer, resetOverlayStack } from '../internal/overlayStack'
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

/**
 * Высота панели.
 *
 * Панель телепортируется в общий портал и лежит рядом с корнем модального окна,
 * а не внутри него: собственный stacking-контекст окна её не накрывает, и
 * статический `--gr-z-dropdown` (1000) оставлял панель под окном (1100). Регрессия
 * жила незаметно, потому что e2e проверяли очередь Esc и фокус, а не порядок
 * отрисовки.
 */
describe('useFloating — высота над модальным окном', () => {
  function mountStyled() {
    const open = ref(false)
    const style = ref<Record<string, unknown>>({})

    const wrapper = mount(defineComponent({
      setup() {
        const reference = ref<HTMLElement | null>(null)
        const floating = ref<HTMLElement | null>(null)
        const { floatingStyle } = useFloating(reference, floating, open)

        watchEffect(() => {
          style.value = floatingStyle.value as Record<string, unknown>
        })

        return { reference, floating }
      },
      template: '<div><button ref="reference" /><div ref="floating" /></div>',
    }), { attachTo: document.body })

    return { wrapper, open, style }
  }

  async function openPanel(open: Ref<boolean>) {
    open.value = true
    // `start()` отложен на тик, `computePosition` — промис внутри него.
    for (let i = 0; i < 4; i += 1) await nextTick()
  }

  function pushModal(): number {
    return pushOverlayLayer({ modal: true, shouldClose: () => true, close: () => {} })
  }

  beforeEach(() => {
    resetOverlayStack()
  })

  it('вне окна панель остаётся на своём слое', async () => {
    const { wrapper, open, style } = mountStyled()
    await openPanel(open)

    expect(style.value.zIndex).toBe('var(--gr-z-dropdown)')
    wrapper.unmount()
  })

  it('немодальные слои высоту не поднимают', async () => {
    // Меню, открытое из меню, остаётся в своём слое: поднимать его не над чем.
    pushOverlayLayer({ modal: false, shouldClose: () => true, close: () => {} })

    const { wrapper, open, style } = mountStyled()
    await openPanel(open)

    expect(style.value.zIndex).toBe('var(--gr-z-dropdown)')
    wrapper.unmount()
  })

  it('внутри окна панель встаёт над ним', async () => {
    pushModal()

    const { wrapper, open, style } = mountStyled()
    await openPanel(open)

    expect(style.value.zIndex).toBe('calc(var(--gr-z-modal) + 1)')
    wrapper.unmount()
  })

  it('вложенные окна поднимают панель над обоими', async () => {
    // Слагаемое — число слоёв, а не шаг шкалы: загрузка (1150) и тосты (1200)
    // обязаны остаться сверху.
    pushModal()
    pushModal()

    const { wrapper, open, style } = mountStyled()
    await openPanel(open)

    expect(style.value.zIndex).toBe('calc(var(--gr-z-modal) + 2)')
    wrapper.unmount()
  })

  it('подъём считается на каждом пересчёте, а не только на открытии', async () => {
    const { wrapper, open, style } = mountStyled()
    await openPanel(open)
    expect(style.value.zIndex).toBe('var(--gr-z-dropdown)')

    // Окно открылось поверх уже открытой панели — следующий пересчёт позиции
    // обязан поднять её, иначе панель осталась бы под ним.
    const id = pushModal()
    open.value = false
    await nextTick()
    await openPanel(open)

    expect(style.value.zIndex).toBe('calc(var(--gr-z-modal) + 1)')
    removeOverlayLayer(id)
    wrapper.unmount()
  })

  it('своя шкала уважается и при подъёме, и без него', async () => {
    const open = ref(false)
    const style = ref<Record<string, unknown>>({})

    const wrapper = mount(defineComponent({
      setup() {
        const reference = ref<HTMLElement | null>(null)
        const floating = ref<HTMLElement | null>(null)
        const { floatingStyle } = useFloating(reference, floating, open, { zIndexVar: '--gr-z-tooltip' })

        watchEffect(() => {
          style.value = floatingStyle.value as Record<string, unknown>
        })

        return { reference, floating }
      },
      template: '<div><button ref="reference" /><div ref="floating" /></div>',
    }), { attachTo: document.body })

    await openPanel(open)
    expect(style.value.zIndex).toBe('var(--gr-z-tooltip)')

    // Подсказка над окном тоже обязана быть видимой: 1050 < 1100.
    pushModal()
    open.value = false
    await nextTick()
    await openPanel(open)
    expect(style.value.zIndex).toBe('calc(var(--gr-z-modal) + 1)')

    wrapper.unmount()
  })
})
