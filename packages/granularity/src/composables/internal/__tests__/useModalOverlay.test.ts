import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'

import type { ModalOverlay, UseModalOverlayOptions } from '../useModalOverlay'
import { useModalOverlay } from '../useModalOverlay'
import { pushOverlayLayer, removeOverlayLayer, resetOverlayStack } from '../overlayStack'

/**
 * Гейт на **сборку** модального слоя, а не на её части: у стека, ловушки,
 * `inert` и скролл-лока есть свои тесты. Здесь проверяется то, что раньше
 * собиралось руками в трёх компонентах и потому могло разъехаться.
 */

type Harness = {
  overlay: ModalOverlay
  open: { value: boolean }
  dismissed: () => number
}

function mountOverlay(options: Partial<UseModalOverlayOptions> & { open?: boolean } = {}) {
  let captured: ModalOverlay | undefined
  const open = ref(options.open ?? true)
  let dismissCount = 0

  const wrapper = mount(defineComponent({
    setup() {
      const panel = ref<HTMLElement | null>(null)

      captured = useModalOverlay(open, () => {
        dismissCount += 1
      }, {
        panel,
        modal: options.modal,
        closeOnEscape: options.closeOnEscape,
        closeOnBackdrop: options.closeOnBackdrop,
        lockScroll: options.lockScroll,
      })

      return () => h('div', { ref: captured!.rootEl as never }, [
        h('div', { ref: panel as never, tabindex: -1 }),
      ])
    },
  }), { attachTo: document.body })

  const harness: Harness = {
    overlay: captured!,
    open,
    dismissed: () => dismissCount,
  }

  return { wrapper, ...harness }
}

/** Слой поверх, зарегистрированный в обход компонента: важен только его порядок. */
function pushLayerAbove(): number {
  return pushOverlayLayer({
    modal: true,
    shouldClose: () => true,
    close: () => {},
    root: () => null,
  })
}

afterEach(() => {
  resetOverlayStack()
  document.body.style.overflow = ''
  document.body.style.paddingRight = ''
})

describe('useModalOverlay', () => {
  it('модальный слой блокирует скролл страницы, немодальный — нет', async () => {
    const modalOverlay = mountOverlay()
    await nextTick()
    expect(document.body.style.overflow).toBe('hidden')
    modalOverlay.wrapper.unmount()

    const plain = mountOverlay({ modal: () => false })
    await nextTick()
    expect(document.body.style.overflow, 'немодальная панель открыта ради страницы под ней').toBe('')
    plain.wrapper.unmount()
  })

  it('снимает блокировку скролла при размонтировании открытым', async () => {
    const { wrapper } = mountOverlay()
    await nextTick()
    expect(document.body.style.overflow).toBe('hidden')

    wrapper.unmount()
    expect(document.body.style.overflow).toBe('')
  })

  /**
   * `inert` вешается только на слой, переставший быть верхним: иначе окно гасит
   * само себя вместе со страницей.
   */
  it('помечает корень `inert`, когда поверх открылся другой слой', async () => {
    const { wrapper, overlay } = mountOverlay()
    await nextTick()

    expect(overlay.isTopmost.value).toBe(true)
    expect(overlay.inertAttr.value).toBeUndefined()

    const above = pushLayerAbove()
    await nextTick()

    expect(overlay.isTopmost.value).toBe(false)
    expect(overlay.inertAttr.value).toBe(true)

    removeOverlayLayer(above)
    await nextTick()

    expect(overlay.inertAttr.value).toBeUndefined()
    wrapper.unmount()
  })

  /**
   * Немодальный слой в вычислении верхнего не участвует вовсе (`syncTopmost`
   * уведомляет только модальные), поэтому `isTopmost` у него ничего не значит —
   * значение имеет только то, что `inert` на него не приходит: под такой
   * панелью продолжают работать.
   */
  it('немодальный слой не гасится, даже когда поверх открыт модальный', async () => {
    const { wrapper, overlay } = mountOverlay({ modal: () => false })
    await nextTick()

    const above = pushLayerAbove()
    await nextTick()

    expect(overlay.inertAttr.value).toBeUndefined()

    removeOverlayLayer(above)
    wrapper.unmount()
  })

  it('присутствие в DOM держится до конца leave-анимации панели', async () => {
    const { wrapper, overlay, open } = mountOverlay()
    await nextTick()

    expect(overlay.isMounted.value).toBe(true)
    expect(overlay.isVisible.value).toBe(true)

    open.value = false
    await nextTick()

    expect(overlay.isVisible.value, 'панель уезжает').toBe(false)
    expect(overlay.isMounted.value, 'поддерево ещё живо, иначе анимации не видно').toBe(true)

    overlay.onPanelAfterLeave()
    expect(overlay.isMounted.value).toBe(false)

    wrapper.unmount()
  })

  describe('клик по подложке', () => {
    function backdropEvent(type: string, sameTarget: boolean): MouseEvent {
      const backdrop = document.createElement('div')
      const inner = document.createElement('div')
      backdrop.append(inner)

      const event = new MouseEvent(type)
      Object.defineProperty(event, 'currentTarget', { value: backdrop })
      Object.defineProperty(event, 'target', { value: sameTarget ? backdrop : inner })

      return event
    }

    it('закрывает, когда нажатие и отпускание пришлись на подложку', () => {
      const { wrapper, overlay, dismissed } = mountOverlay()

      overlay.backdrop.mousedown(backdropEvent('mousedown', true))
      overlay.backdrop.click(backdropEvent('click', true))

      expect(dismissed()).toBe(1)
      wrapper.unmount()
    })

    /** Выделение текста в панели, отпущенное за её границей, — не клик по подложке. */
    it('не закрывает, если нажатие началось не на подложке', () => {
      const { wrapper, overlay, dismissed } = mountOverlay()

      overlay.backdrop.mousedown(backdropEvent('mousedown', false))
      overlay.backdrop.click(backdropEvent('click', true))

      expect(dismissed()).toBe(0)
      wrapper.unmount()
    })

    it('молчит при `closeOnBackdrop: false`', () => {
      const { wrapper, overlay, dismissed } = mountOverlay({ closeOnBackdrop: () => false })

      overlay.backdrop.mousedown(backdropEvent('mousedown', true))
      overlay.backdrop.click(backdropEvent('click', true))

      expect(dismissed()).toBe(0)
      wrapper.unmount()
    })
  })

  it('Esc адресован слою и уважает свой предикат', async () => {
    const { wrapper, dismissed } = mountOverlay({ closeOnEscape: () => false })
    await nextTick()

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', cancelable: true }))
    expect(dismissed(), 'предикат запретил закрытие').toBe(0)

    wrapper.unmount()

    const closable = mountOverlay({ closeOnEscape: () => true })
    await nextTick()

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', cancelable: true }))
    expect(closable.dismissed()).toBe(1)

    closable.wrapper.unmount()
  })
})
