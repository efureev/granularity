import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'

import GrPopover from '../GrPopover.vue'

/**
 * `GrPopover` — якорный немодальный оверлей. Роль «универсального поповера» до
 * него исполнял `GrDropdown`, который жёстко объявляет `role="menu"` и водит
 * фокус по пунктам: для формы или подтверждения это неверная семантика.
 */

const TRIGGER = `<template #trigger="{ triggerProps }"><button v-bind="triggerProps">Открыть</button></template>`
const CONTENT = `<template #content="{ close }"><button data-inner @click="close">Внутри</button></template>`

let mounted: ReturnType<typeof mount> | null = null

function mountPopover(props: Record<string, unknown> = {}) {
  mounted = mount(GrPopover, {
    props: { ariaLabel: 'Панель', ...props },
    slots: { trigger: TRIGGER, content: CONTENT },
    attachTo: document.body,
  })

  return mounted as ReturnType<typeof mount> & { vm: { open: () => void, close: () => void } }
}

afterEach(() => {
  // Панель телепортируется в `body` и переживает размонтирование wrapper'а —
  // без уборки следующий тест нашёл бы чужую.
  mounted?.unmount()
  mounted = null
  document.body.innerHTML = ''
})

/** Панель живёт в `body` (телепорт), а не внутри wrapper'а. */
function panelEl(): HTMLElement | null {
  return document.body.querySelector('[data-gr-popover-panel]')
}

/** `v-show` прячет панель через `display: none`, из DOM она не исчезает. */
function isPanelVisible(): boolean {
  const el = panelEl()
  return el !== null && el.style.display !== 'none'
}

const trigger = (wrapper: ReturnType<typeof mountPopover>) => wrapper.find('[data-gr-popover-trigger]')

/** Esc гасится стеком слоёв в capture-фазе на `window`. */
async function pressEscape(): Promise<void> {
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
  await nextTick()
}

describe('GrPopover', () => {
  it('открывается и закрывается по клику на триггер', async () => {
    const wrapper = mountPopover()
    expect(isPanelVisible()).toBe(false)

    await trigger(wrapper).trigger('click')
    expect(isPanelVisible()).toBe(true)

    await trigger(wrapper).trigger('click')
    expect(isPanelVisible()).toBe(false)
  })

  it('без `v-model` ведёт состояние сам', async () => {
    // Поповер без модели — самый частый случай, требовать `v-model` нельзя.
    const wrapper = mountPopover()

    await trigger(wrapper).trigger('click')

    expect(isPanelVisible()).toBe(true)
    expect(wrapper.emitted('update:open')?.at(-1)).toEqual([true])
  })

  it('в controlled-режиме состоянием владеет родитель', async () => {
    const wrapper = mountPopover({ open: false })

    await trigger(wrapper).trigger('click')

    // Событие ушло, но панель осталась закрытой: значение не менял никто.
    expect(wrapper.emitted('update:open')?.at(-1)).toEqual([true])
    expect(isPanelVisible()).toBe(false)

    await wrapper.setProps({ open: true })
    expect(isPanelVisible()).toBe(true)
  })

  it('`trigger="manual"` не реагирует на клик', async () => {
    const wrapper = mountPopover({ trigger: 'manual' })

    await trigger(wrapper).trigger('click')

    expect(isPanelVisible()).toBe(false)
  })

  it('`disabled` не даёт открыться', async () => {
    const wrapper = mountPopover({ disabled: true })

    await trigger(wrapper).trigger('click')

    expect(isPanelVisible()).toBe(false)
    expect(wrapper.find('button').attributes('disabled')).toBeDefined()
  })

  describe('закрытие', () => {
    it('Esc закрывает', async () => {
      const wrapper = mountPopover()
      await trigger(wrapper).trigger('click')

      await pressEscape()

      expect(isPanelVisible()).toBe(false)
    })

    it('`closeOnEsc: false` оставляет открытым', async () => {
      const wrapper = mountPopover({ closeOnEsc: false })
      await trigger(wrapper).trigger('click')

      await pressEscape()

      expect(isPanelVisible()).toBe(true)
    })

    it('клик вне закрывает, клик внутри панели — нет', async () => {
      const wrapper = mountPopover()
      await trigger(wrapper).trigger('click')

      document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await nextTick()
      expect(isPanelVisible()).toBe(false)

      await trigger(wrapper).trigger('click')
      panelEl()?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await nextTick()
      expect(isPanelVisible()).toBe(true)
    })

    it('`closeOnClickOutside: false` оставляет открытым', async () => {
      const wrapper = mountPopover({ closeOnClickOutside: false })
      await trigger(wrapper).trigger('click')

      document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await nextTick()

      expect(isPanelVisible()).toBe(true)
    })

    it('по умолчанию клик внутри не закрывает — иначе форма закрывалась бы на первом поле', async () => {
      const wrapper = mountPopover()
      await trigger(wrapper).trigger('click')

      panelEl()?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await nextTick()

      expect(isPanelVisible()).toBe(true)
    })

    it('`closeOnContentClick` закрывает по клику внутри — режим меню', async () => {
      const wrapper = mountPopover({ closeOnContentClick: true })
      await trigger(wrapper).trigger('click')

      panelEl()?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await nextTick()

      expect(isPanelVisible()).toBe(false)
    })

    it('слот получает `close`', async () => {
      const wrapper = mountPopover()
      await trigger(wrapper).trigger('click')

      document.body.querySelector<HTMLElement>('[data-inner]')?.dispatchEvent(
        new MouseEvent('click', { bubbles: true }),
      )
      await nextTick()

      expect(isPanelVisible()).toBe(false)
    })
  })

  describe('доступность', () => {
    it('триггер получает aria-состояния', async () => {
      const wrapper = mountPopover()
      const button = wrapper.find('button')

      expect(button.attributes('aria-haspopup')).toBe('dialog')
      expect(button.attributes('aria-expanded')).toBe('false')
      expect(button.attributes('aria-controls')).toBeUndefined()

      await trigger(wrapper).trigger('click')

      expect(button.attributes('aria-expanded')).toBe('true')
      expect(button.attributes('aria-controls')).toBe(panelEl()?.id)
    })

    it('панель по умолчанию — диалог с доступным именем', () => {
      mountPopover()

      expect(panelEl()?.getAttribute('role')).toBe('dialog')
      expect(panelEl()?.getAttribute('aria-label')).toBe('Панель')
    })

    it('`labelledBy` важнее `ariaLabel`', () => {
      // Видимый заголовок — лучшее имя, чем дублирующая его строка в пропе.
      mountPopover({ labelledBy: 'title-id' })

      expect(panelEl()?.getAttribute('aria-labelledby')).toBe('title-id')
      expect(panelEl()?.getAttribute('aria-label')).toBeNull()
    })

    it('роль задаётся пропом — на примитиве строятся меню и списки', () => {
      const wrapper = mountPopover({ role: 'menu' })

      expect(panelEl()?.getAttribute('role')).toBe('menu')
      expect(wrapper.find('button').attributes('aria-haspopup')).toBe('menu')
    })

    it('`role="none"` убирает роль и `aria-haspopup`', () => {
      const wrapper = mountPopover({ role: 'none' })

      expect(panelEl()?.getAttribute('role')).toBeNull()
      expect(wrapper.find('button').attributes('aria-haspopup')).toBeUndefined()
    })

    it('фокус переходит на панель, а не на первый контрол внутри', async () => {
      // Сфокусировать поле за пользователя — решение содержимого, не оболочки.
      const wrapper = mountPopover()

      await trigger(wrapper).trigger('click')
      await nextTick()

      expect(document.activeElement).toBe(panelEl())
    })

    it('`autoFocus: false` фокус не трогает', async () => {
      const wrapper = mountPopover({ autoFocus: false })

      await trigger(wrapper).trigger('click')
      await nextTick()

      expect(document.activeElement).not.toBe(panelEl())
    })

    it('панель фокусируема программно, но вне таб-порядка', () => {
      // Ловушки фокуса нет намеренно: Tab обязан уводить наружу из немодального слоя.
      mountPopover()

      expect(panelEl()?.getAttribute('tabindex')).toBe('-1')
    })
  })

  it.each([
    ['xs', 'p-2'],
    ['lg', 'p-4'],
  ])('размер %s меняет классы панели', (size, expected) => {
    mountPopover({ size })

    expect([...(panelEl()?.classList ?? [])]).toContain(expected)
  })

  it('императивный API открывает и закрывает', async () => {
    const wrapper = mountPopover()

    wrapper.vm.open()
    await nextTick()
    expect(isPanelVisible()).toBe(true)

    wrapper.vm.close()
    await nextTick()
    expect(isPanelVisible()).toBe(false)
  })
})

/**
 * Модальный режим — второй класс поведения того же компонента: поповер с формой
 * внутри обязан изолировать фон, иначе Tab уводит пользователя на страницу, к
 * которой поповер и относится. Собран той же сборкой, что окно и drawer
 * (`useModalOverlay`), поэтому проверяем не механику примитивов, а то, что
 * режим включается пропом и по умолчанию выключен.
 */
describe('GrPopover — модальный режим', () => {
  it('по умолчанию слой немодальный: ни aria-modal, ни блокировки скролла', async () => {
    const wrapper = mountPopover()

    wrapper.vm.open()
    await nextTick()

    expect(panelEl()?.getAttribute('aria-modal')).toBeNull()
    expect(document.body.style.overflow).toBe('')
  })

  it('`modal` объявляет панель модальной и блокирует скролл страницы', async () => {
    const wrapper = mountPopover({ modal: true })

    wrapper.vm.open()
    await nextTick()

    expect(panelEl()?.getAttribute('aria-modal')).toBe('true')
    expect(document.body.style.overflow).toBe('hidden')

    wrapper.vm.close()
    await nextTick()

    expect(document.body.style.overflow, 'скролл отпускается при закрытии').toBe('')
  })

  it('`modal` уводит фон из дерева доступности, а при закрытии возвращает', async () => {
    const background = document.createElement('div')
    document.body.append(background)

    const wrapper = mountPopover({ modal: true })

    wrapper.vm.open()
    await nextTick()

    expect(background.hasAttribute('inert')).toBe(true)

    wrapper.vm.close()
    await nextTick()

    expect(background.hasAttribute('inert')).toBe(false)
    background.remove()
  })

  it('немодальный поповер фон не трогает: под ним продолжают работать', async () => {
    const background = document.createElement('div')
    document.body.append(background)

    const wrapper = mountPopover()

    wrapper.vm.open()
    await nextTick()

    expect(background.hasAttribute('inert')).toBe(false)
    background.remove()
  })

  /**
   * В модальном режиме перенос фокуса не опционален: фон в `inert`, и фокус,
   * оставленный снаружи, попал бы в недоступное поддерево.
   */
  it('`modal` переносит фокус в панель даже при autoFocus=false', async () => {
    const wrapper = mountPopover({ modal: true, autoFocus: false })

    wrapper.vm.open()
    await nextTick()
    await nextTick()

    expect(document.activeElement).toBe(panelEl())
  })
})
