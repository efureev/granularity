import { mount } from '@vue/test-utils'
import { defineComponent, nextTick, ref } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useOverlayLayer } from '../composables/useOverlayLayer'
import {
  floatingLayerZIndex,
  modalLayerZIndex,
  overlayStackSize,
  pushOverlayLayer,
  removeOverlayLayer,
  resetOverlayStack,
} from '../composables/internal/overlayStack'

/**
 * Гейт единого стека слоёв.
 *
 * Один список отвечает на два **разных** вопроса, и в этом вся суть:
 *
 *  - **Esc** адресуется последнему слою любого рода: дропдаун, открытый внутри
 *    модалки, обязан закрыться первым;
 *  - **`inert`** ставится на модалки ниже последней **модальной**. Немодальный
 *    слой сверху модалку не «понижает» — иначе окно ушло бы в `inert` вместе со
 *    своим же открытым дропдауном и перестало отвечать.
 */

function pressEscape(init: KeyboardEventInit = {}): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true, ...init })
  window.dispatchEvent(event)
  return event
}

describe('стек слоёв оверлеев', () => {
  afterEach(() => resetOverlayStack())

  it('Esc во время IME-композиции адресован композиции, а не слою', () => {
    const close = vi.fn()
    pushOverlayLayer({ modal: true, shouldClose: () => true, close })

    const event = pressEscape({ isComposing: true })

    expect(close).not.toHaveBeenCalled()
    expect(event.defaultPrevented, 'событие остаётся IME').toBe(false)
  })

  it('Esc адресуется последнему слою любого рода', () => {
    const closeModal = vi.fn()
    const closePopover = vi.fn()

    pushOverlayLayer({ modal: true, shouldClose: () => true, close: closeModal })
    pushOverlayLayer({ modal: false, shouldClose: () => true, close: closePopover })

    pressEscape()

    expect(closePopover, 'верхний — поповер').toHaveBeenCalledTimes(1)
    expect(closeModal).not.toHaveBeenCalled()
  })

  it('нижняя модалка помечается неверхней, когда открыта вторая модалка', () => {
    const bottom = vi.fn()
    const top = vi.fn()

    pushOverlayLayer({ modal: true, shouldClose: () => true, close: () => {}, setTopmost: bottom })
    expect(bottom).toHaveBeenLastCalledWith(true)

    pushOverlayLayer({ modal: true, shouldClose: () => true, close: () => {}, setTopmost: top })

    expect(bottom, 'нижняя модалка уходит в inert').toHaveBeenLastCalledWith(false)
    expect(top).toHaveBeenLastCalledWith(true)
  })

  it('немодальный слой сверху НЕ понижает модалку', () => {
    // Иначе окно ушло бы в `inert` вместе со своим же открытым дропдауном.
    const modal = vi.fn()

    pushOverlayLayer({ modal: true, shouldClose: () => true, close: () => {}, setTopmost: modal })
    pushOverlayLayer({ modal: false, shouldClose: () => true, close: () => {} })

    expect(modal, 'модалка осталась верхней').toHaveBeenLastCalledWith(true)
  })

  it('закрытие верхней модалки возвращает верхний статус следующей', () => {
    const bottom = vi.fn()

    pushOverlayLayer({ modal: true, shouldClose: () => true, close: () => {}, setTopmost: bottom })
    const topId = pushOverlayLayer({ modal: true, shouldClose: () => true, close: () => {} })
    expect(bottom).toHaveBeenLastCalledWith(false)

    removeOverlayLayer(topId)

    expect(bottom).toHaveBeenLastCalledWith(true)
  })

  it('Esc гасится, даже если верхний слой не закрывается', () => {
    const below = vi.fn()

    pushOverlayLayer({ modal: true, shouldClose: () => true, close: below })
    pushOverlayLayer({ modal: true, shouldClose: () => false, close: () => {} })

    const event = pressEscape()

    expect(below, 'событие не проваливается вниз').not.toHaveBeenCalled()
    expect(event.defaultPrevented).toBe(true)
  })

  it('пустой стек снимает обработчик', () => {
    const close = vi.fn()
    const id = pushOverlayLayer({ modal: false, shouldClose: () => true, close })
    removeOverlayLayer(id)

    pressEscape()

    expect(close).not.toHaveBeenCalled()
    expect(overlayStackSize()).toBe(0)
  })
})

/**
 * Возврат фокуса — второе правило контракта, и оно **не** проверяется тем, что
 * компоненты рендерятся: до сведения в один контракт возврат был написан заново
 * в каждом оверлее и ни одним тестом не покрыт.
 */
describe('useOverlayLayer: возврат фокуса', () => {
  function mountLayer() {
    const Harness = defineComponent({
      setup() {
        const open = ref(false)
        const panel = ref<HTMLElement | null>(null)
        useOverlayLayer(open, () => {
          open.value = false
        }, { root: panel })
        return { open, panel }
      },
      template: `
        <button data-testid="trigger" @click="open = true">open</button>
        <button data-testid="outside">outside</button>
        <div v-if="open" ref="panel"><button data-testid="inside">inside</button></div>
      `,
    })
    return mount(Harness, { attachTo: document.body })
  }

  afterEach(() => {
    document.body.innerHTML = ''
    resetOverlayStack()
  })

  it('возвращает фокус триггеру, если на момент закрытия фокус внутри слоя', async () => {
    const wrapper = mountLayer()
    const trigger = wrapper.find('[data-testid="trigger"]').element as HTMLElement

    trigger.focus()
    await wrapper.find('[data-testid="trigger"]').trigger('click')
    await nextTick()

    ;(wrapper.find('[data-testid="inside"]').element as HTMLElement).focus()

    pressEscape()
    // Возврат отложен на тик: ловушка фокуса слоя снимает слушатели в том же
    // флаше, и немедленный `focus()` она затащила бы обратно в слой.
    await nextTick()
    await nextTick()

    expect(document.activeElement).toBe(trigger)
    wrapper.unmount()
  })

  it('НЕ отбирает фокус, если пользователь успел уйти из слоя сам', async () => {
    const wrapper = mountLayer()
    const outside = wrapper.find('[data-testid="outside"]').element as HTMLElement

    ;(wrapper.find('[data-testid="trigger"]').element as HTMLElement).focus()
    await wrapper.find('[data-testid="trigger"]').trigger('click')
    await nextTick()

    // Пользователь кликнул в другое поле — фокус уже там.
    outside.focus()

    pressEscape()
    await nextTick()

    expect(document.activeElement).toBe(outside)
    wrapper.unmount()
  })
})

/**
 * Высота модального слоя.
 *
 * У всех модалок один токен (`--gr-z-modal`), поэтому без прибавки порядок
 * отрисовки решал бы порядок узлов в портале — а он задаётся **созданием**
 * телепорта, не открытием слоя. Статически объявленный диалог оказывался под
 * окном, открытым позже, и получал от стека `inert`: пользователь видел окно,
 * которое не отвечает, и не видел диалога, который отвечает.
 */
describe('глубина модального слоя', () => {
  afterEach(() => resetOverlayStack())

  function pushModal(depths: number[], modal = true): number {
    return pushOverlayLayer({
      modal,
      shouldClose: () => true,
      close: () => {},
      setDepth: (value) => { depths.push(value) },
    })
  }

  it('каждый следующий модальный слой глубже предыдущего', () => {
    const first: number[] = []
    const second: number[] = []
    const third: number[] = []

    pushModal(first)
    pushModal(second)
    pushModal(third)

    expect(first.at(-1)).toBe(0)
    expect(second.at(-1)).toBe(1)
    expect(third.at(-1)).toBe(2)
  })

  it('закрытие среднего слоя пересчитывает тех, кто выше', () => {
    const first: number[] = []
    const second: number[] = []
    const third: number[] = []

    pushModal(first)
    const middle = pushModal(second)
    pushModal(third)

    removeOverlayLayer(middle)

    // Верхний спускается на освободившийся уровень, иначе между слоями
    // остаётся дыра, в которую попадает floating-панель.
    expect(third.at(-1)).toBe(1)
    expect(first.at(-1)).toBe(0)
  })

  it('немодальный слой глубину модальных не сдвигает', () => {
    const modal: number[] = []
    const popover: number[] = []

    pushModal(modal)
    pushModal(popover, false)
    const above: number[] = []
    pushModal(above)

    // Поповер живёт в том же стеке ради Esc, но высоту ему считает
    // `useFloating` — от числа модалок, а не от позиции в списке.
    expect(popover).toHaveLength(0)
    expect(above.at(-1)).toBe(1)
  })

  it('формула высоты не плодит арифметику на единственном окне', () => {
    expect(modalLayerZIndex(0)).toBe('var(--gr-z-modal)')
    expect(modalLayerZIndex(2)).toBe('calc(var(--gr-z-modal) + 2)')
    // Escape-hatch: глубина прибавляется к подменённой переменной.
    expect(modalLayerZIndex(1, '--app-z-viewer')).toBe('calc(var(--app-z-viewer) + 1)')
  })

  it('панель внутри окна остаётся выше самого верхнего окна', () => {
    const depths: number[] = []
    pushModal(depths)
    pushModal([])

    // Два окна: верхнее на `+1`, панель из него — на `+2`.
    expect(floatingLayerZIndex('--gr-z-dropdown')).toBe('calc(var(--gr-z-modal) + 2)')
  })

  it('снаружи окон панель остаётся на своей шкале', () => {
    expect(floatingLayerZIndex('--gr-z-dropdown')).toBe('var(--gr-z-dropdown)')
  })
})
