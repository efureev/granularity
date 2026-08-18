import { mount } from '@vue/test-utils'
import type { Ref } from 'vue'
import { defineComponent, nextTick, ref, watchEffect } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { computePosition } from '@floating-ui/dom'

import { pushOverlayLayer, removeOverlayLayer, resetOverlayStack } from '../internal/overlayStack'
import type { GrFloatingAnchorRect } from '../useFloating'
import { createFloatingAnchor, useFloating } from '../useFloating'

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

/**
 * Виртуальный якорь: позиционирование по точке курсора, у которой нет элемента
 * в DOM. Проверяем не пиксели (в jsdom `getBoundingClientRect` нулевой, а
 * `computePosition` замокан), а то, что именно доехало до движка и когда
 * пересоздаётся подписка.
 */
describe('useFloating — виртуальный якорь', () => {
  beforeEach(() => {
    autoUpdateMock.mockClear()
    autoUpdateCleanup.mockClear()
    vi.mocked(computePosition).mockClear()
  })

  function mountAnchored(anchor: Ref<GrFloatingAnchorRect | null>) {
    const open = ref(false)
    const anchorEl = createFloatingAnchor(() => anchor.value)
    let update = (): void => {}

    const wrapper = mount(defineComponent({
      setup() {
        const floating = ref<HTMLElement | null>(null)
        update = useFloating(() => anchorEl, floating, open).update
        return { floating }
      },
      template: '<div><div ref="floating" /></div>',
    }), { attachTo: document.body })

    return { wrapper, open, anchorEl, update: () => update() }
  }

  async function settle() {
    for (let i = 0; i < 4; i += 1) await nextTick()
  }

  it('прямоугольник считается от координат и согласован по сторонам', () => {
    const point = createFloatingAnchor(() => ({ x: 10, y: 20 }))
    // Точка курсора — прямоугольник 0×0: `flip` и `shift` меряют её как обычный
    // якорь нулевого размера, поэтому стороны обязаны сойтись в одну точку.
    expect(point.getBoundingClientRect()).toMatchObject({
      x: 10, y: 20, width: 0, height: 0, top: 20, left: 10, right: 10, bottom: 20,
    })

    const row = createFloatingAnchor(() => ({ x: 4, y: 8, width: 200, height: 32 }))
    expect(row.getBoundingClientRect()).toMatchObject({
      x: 4, y: 8, width: 200, height: 32, top: 8, left: 4, right: 204, bottom: 40,
    })
  })

  it('пустой якорь не роняет измерение', () => {
    // Меню закрыто — координат ещё нет, а `autoUpdate` уже может дёрнуть замер.
    expect(createFloatingAnchor(() => null).getBoundingClientRect()).toMatchObject({ x: 0, y: 0 })
  })

  it('виртуальный якорь доезжает до движка вместо элемента', async () => {
    const anchor = ref<GrFloatingAnchorRect | null>({ x: 10, y: 20 })
    const { wrapper, open, anchorEl } = mountAnchored(anchor)

    open.value = true
    await settle()

    expect(vi.mocked(computePosition).mock.calls[0]?.[0]).toBe(anchorEl)
    expect(autoUpdateMock.mock.calls[0]?.[0]).toBe(anchorEl)

    wrapper.unmount()
  })

  /**
   * Второй правый клик по другой точке. Объект якоря один на всё время жизни,
   * поэтому подписка обязана уцелеть: пересоздавать её на каждое движение
   * курсора значило бы рвать `autoUpdate` ради смены двух чисел.
   */
  it('смена координат пересчитывает позицию, но не переподписывает autoUpdate', async () => {
    const anchor = ref<GrFloatingAnchorRect | null>({ x: 10, y: 20 })
    const { wrapper, open, anchorEl, update } = mountAnchored(anchor)

    open.value = true
    await settle()
    expect(autoUpdateMock).toHaveBeenCalledTimes(1)

    anchor.value = { x: 300, y: 400 }
    update()
    await settle()

    expect(autoUpdateMock).toHaveBeenCalledTimes(1)
    expect(anchorEl.getBoundingClientRect()).toMatchObject({ x: 300, y: 400 })
    expect(vi.mocked(computePosition).mock.calls.length).toBeGreaterThan(1)

    wrapper.unmount()
  })

  it('смена самой ссылки снимает старую подписку и заводит новую', async () => {
    const open = ref(false)
    const useAnchor = ref(false)
    const anchorEl = createFloatingAnchor(() => ({ x: 1, y: 2 }))

    const wrapper = mount(defineComponent({
      setup() {
        const reference = ref<HTMLElement | null>(null)
        const floating = ref<HTMLElement | null>(null)
        useFloating(() => (useAnchor.value ? anchorEl : reference.value), floating, open)
        return { reference, floating }
      },
      template: '<div><button ref="reference" /><div ref="floating" /></div>',
    }), { attachTo: document.body })

    open.value = true
    await settle()
    expect(autoUpdateMock).toHaveBeenCalledTimes(1)
    expect(autoUpdateCleanup).not.toHaveBeenCalled()

    useAnchor.value = true
    await settle()

    expect(autoUpdateCleanup).toHaveBeenCalledTimes(1)
    expect(autoUpdateMock).toHaveBeenCalledTimes(2)
    expect(autoUpdateMock.mock.calls[1]?.[0]).toBe(anchorEl)

    wrapper.unmount()
  })
})
