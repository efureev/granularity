import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'

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
  vi.restoreAllMocks()
  // Панель телепортируется в `body` и переживает размонтирование wrapper'а —
  // без уборки следующий тест нашёл бы чужую.
  mounted?.unmount()
  mounted = null
  document.body.innerHTML = ''
})

/** Панель живёт в `body` (телепорт), а не внутри wrapper'а. */
/**
 * `computePosition` асинхронен, и `autoUpdate` доводит позицию не в том же тике,
 * в котором панель появилась: одних `nextTick` мало, нужен ещё макрозадачный шаг.
 */
async function waitFloating(): Promise<void> {
  for (let i = 0; i < 10; i += 1) {
    await nextTick()
    await Promise.resolve()
  }

  await new Promise(resolve => setTimeout(resolve, 32))
  await nextTick()
}

function rect(left: number, top: number, width: number, height: number): DOMRect {
  return {
    x: left,
    y: top,
    top,
    right: left + width,
    bottom: top + height,
    left,
    width,
    height,
    toJSON: () => ({}),
  }
}

/** `computePosition` асинхронен: позиция появляется макрозадачей позже. */
function flushFloatingUpdate(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0))
}

/** Панель либо скрыта стилем, либо не отрисована вовсе. */
function isClosed(): boolean {
  const panel = panelEl()

  return panel === null || panel.style.display === 'none'
}

function panelEl(): HTMLElement | null {
  return document.body.querySelector('[data-gr-popover-panel]')
}

/** `v-show` прячет панель через `display: none`, из DOM она не исчезает. */
function isPanelVisible(): boolean {
  const el = panelEl()
  return el !== null && el.style.display !== 'none'
}

/**
 * Кнопка с привязанным `triggerProps`, а не обёртка вокруг неё.
 *
 * Клик триггера живёт в `triggerProps`, поэтому обёртка на него не реагирует,
 * пока внутри есть привязанный элемент — иначе панель открывал бы любой клик по
 * слоту, включая клик по вложенной кнопке. Пользователь нажимает кнопку, и тест
 * обязан делать то же.
 */
const trigger = (wrapper: ReturnType<typeof mountPopover>) => wrapper.find('[data-gr-popover-trigger] button')

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

/**
 * Якорный режим: панель встаёт у точки вьюпорта, а элемента-триггера нет вовсе.
 * На этом собирается `GrContextMenu` — меню по правому клику.
 */
describe('GrPopover — якорь вместо триггера', () => {
  function mountAnchored(props: Record<string, unknown> = {}) {
    mounted = mount(GrPopover, {
      props: { ariaLabel: 'Меню', anchor: { x: 40, y: 60 }, open: true, trigger: 'manual', ...props },
      slots: { content: CONTENT },
      attachTo: document.body,
    })

    return mounted
  }

  it('без слота триггера обёртка не рендерится вовсе', async () => {
    const wrapper = mountAnchored()
    await nextTick()

    // Пустая обёртка `inline-block` осталась бы строчным боксом в потоке
    // страницы и в некоторых раскладках дала бы лишнюю строку высоты.
    expect(wrapper.find('[data-gr-popover-trigger]').exists()).toBe(false)
    expect(isPanelVisible()).toBe(true)
  })

  it('панель сохраняет роль и доступное имя без триггера', async () => {
    mountAnchored({ role: 'menu' })
    await nextTick()

    expect(panelEl()?.getAttribute('role')).toBe('menu')
    expect(panelEl()?.getAttribute('aria-label')).toBe('Меню')
  })

  it('клик вне панели закрывает её и в якорном режиме', async () => {
    const wrapper = mountAnchored({ open: undefined })
    ;(wrapper.vm as unknown as { open: () => void }).open()
    await nextTick()
    expect(isPanelVisible()).toBe(true)

    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await nextTick()

    expect(isPanelVisible()).toBe(false)
  })

  it('якорь и слот триггера сосуществуют: обёртка на месте', async () => {
    mounted = mount(GrPopover, {
      props: { ariaLabel: 'Панель', anchor: { x: 10, y: 10 }, open: true },
      slots: { trigger: TRIGGER, content: CONTENT },
      attachTo: document.body,
    })
    await nextTick()

    expect(mounted.find('[data-gr-popover-trigger]').exists()).toBe(true)
    expect(isPanelVisible()).toBe(true)
  })
})

describe('GrPopover — поле панели', () => {
  it('по умолчанию поле есть', async () => {
    mountPopover({ open: true })
    await nextTick()

    expect(panelEl()?.className).toContain('p-3')
  })

  /**
   * `contentClass="p-0"` здесь не работает: поле и кегль приезжают одной строкой
   * равной специфичности, и победителя выбрал бы порядок правил в CSS.
   */
  it('`padding="none"` снимает поле, но оставляет кегль', async () => {
    mountPopover({ open: true, padding: 'none' })
    await nextTick()

    const className = panelEl()?.className ?? ''
    expect(className).not.toContain('p-3')
    expect(className).toContain('text-[length:var(--gr-control-text-md)]')
  })

  /**
   * Ширина панели — две независимые оси и один неотключаемый предел.
   *
   * Потолок содержимого — дефолт `22rem`, снимается хуком. Предел слоя —
   * `calc(100vw-1rem)` — стоит вторым операндом `min()` и снаружи не
   * отключается ничем: это и проверяется, потому что раньше он держался на
   * честном слове вместе с потолком, в одной утилите.
   */
  describe('ширина панели', () => {
    it('без переопределений потолок прежний — 22rem', async () => {
      mountPopover({ open: true })
      await nextTick()

      expect(panelEl()?.className).toContain('max-w-[min(var(--gr-popover-max-width,22rem),calc(100vw-1rem))]')
    })

    it('предел вьюпорта стоит в той же утилите и снаружи не отключается', async () => {
      mountPopover({ open: true })
      await nextTick()

      const width = [...(panelEl()?.classList ?? [])].find(cls => cls.startsWith('max-w-'))

      // Хук — только первый операнд `min()`. Что бы ему ни присвоили снаружи,
      // второй остаётся: панель не выйдет за вьюпорт даже при `100vw`.
      expect(width).toContain('var(--gr-popover-max-width,22rem)')
      expect(width).toContain('calc(100vw-1rem)')
      expect(width?.startsWith('max-w-[min(')).toBe(true)
    })

    it('`matchWidth: min` доезжает до `useFloating`', async () => {
      mountPopover({ open: true, matchWidth: 'min' })
      await waitFloating()

      // `size`-мидлвар в режиме `min` ставит `width: max-content` и `min-width`
      // от триггера — по инлайновому стилю видно, что проп дошёл.
      expect(panelEl()?.style.width).toBe('max-content')
    })

    it('по умолчанию ширина у триггера не берётся', async () => {
      mountPopover({ open: true })
      await waitFloating()

      expect(panelEl()?.style.width).toBe('')
    })

    /**
     * Панель живёт в портале, поэтому обёртка триггера ей не предок: хук,
     * поставленный инлайновым стилем на компонент, до панели не доходит.
     * Единственный путь — `contentClass`. Тест держит это поведение зафиксированным,
     * потому что промах здесь молчаливый: стиль применился, эффекта нет.
     */
    it('хук доезжает до панели через `contentClass`', async () => {
      mountPopover({ open: true, contentClass: '[--gr-popover-max-width:100vw]' })
      await nextTick()

      expect(panelEl()?.className).toContain('[--gr-popover-max-width:100vw]')
    })

    it('панель — не потомок обёртки триггера, и это причина предыдущего теста', async () => {
      const wrapper = mountPopover({ open: true })
      await nextTick()

      expect(wrapper.element.contains(panelEl())).toBe(false)
    })

    /**
     * `min` — это пол, а не источник ширины, и в CSS `min-width` сильнее
     * `max-width`. Значит триггер шире потолка перевесит потолок — поведение
     * верное, но неочевидное, поэтому зафиксировано тестом, а не только доком.
     */
    it('`matchWidth: min` ставит пол, а не ширину — он и перевесит потолок', async () => {
      mountPopover({ open: true, matchWidth: 'min' })
      await waitFloating()

      expect(panelEl()?.style.width).toBe('max-content')
      expect(panelEl()?.style.minWidth).not.toBe('')
    })

    it('`matchWidth: true` задаёт ширину, и её потолок срезает', async () => {
      mountPopover({ open: true, matchWidth: true })
      await waitFloating()

      // Ширина ставится инлайново, потолок остаётся классом и срежет её при превышении.
      expect(panelEl()?.style.width).not.toBe('max-content')
      expect(panelEl()?.style.minWidth).toBe('')
    })

    it('`matchWidth` не трогает потолок: оси независимы', async () => {
      mountPopover({ open: true, matchWidth: 'min' })
      await waitFloating()

      // Ширину задаёт мидлвар инлайновым стилем, потолок остаётся классом:
      // «шириной с триггер, но не шире читаемого».
      expect(panelEl()?.style.width).toBe('max-content')
      expect(panelEl()?.className).toContain('max-w-[min(var(--gr-popover-max-width,22rem)')
    })
  })

  /**
   * Потолок высоты. В отличие от ширины, вторым операндом стоит не константа, а
   * замер слоя: доступное место зависит от того, где стоит триггер, и меняется
   * на скролле.
   */
  describe('потолок высоты панели', () => {
    it('замер доступного места приезжает на саму панель', async () => {
      mountPopover({ open: true })
      await waitFloating()

      // Панель телепортирована, и кастомные свойства в портал не наследуются:
      // замер обязан стоять на самом элементе, иначе `var()` в его классе
      // разрешится в фолбэк и потолка не будет вовсе.
      expect(panelEl()?.style.getPropertyValue('--gr-floating-available-height'))
        .toMatch(/^\d+px$/)
    })

    it('потолок стоит вторым операндом `min()` — хук его не снимает', async () => {
      mountPopover({ open: true })
      await waitFloating()

      expect(panelEl()?.className)
        .toContain('max-h-[min(var(--gr-popover-max-height,100vh),var(--gr-floating-available-height,100vh))]')
    })

    /**
     * Потолок без скролла не ограничивает, а обрезает: содержимое уходит под
     * нижний край панели и достать его нечем. Поэтому они приезжают вместе.
     */
    it('панель скроллится, а не обрезает содержимое', async () => {
      mountPopover({ open: true })
      await waitFloating()

      expect(panelEl()?.className).toContain('overflow-y-auto')
    })
  })

  /**
   * Обёртка триггера — `inline-block`, и это верно для кнопки: панель встаёт у
   * её края, а не у края колонки. Но форм-контрол объявляет себя `w-full`, и
   * относительно обжатой обёртки это даёт ширину по содержимому: пикер цвета в
   * поле формы шириной 384px рисовался на 113px рядом с полем ввода на все 384px.
   */
  describe('раскладка обёртки триггера', () => {
    it('по умолчанию обжимает содержимое', async () => {
      const wrapper = mountPopover()
      await nextTick()

      const trigger = wrapper.get('[data-gr-popover-trigger]')
      expect(trigger.classes()).toContain('inline-block')
      expect(trigger.classes()).not.toContain('w-full')
    })

    it('`block` растягивает её на всю ширину родителя', async () => {
      const wrapper = mountPopover({ block: true })
      await nextTick()

      const trigger = wrapper.get('[data-gr-popover-trigger]')
      expect(trigger.classes()).toContain('block')
      expect(trigger.classes()).toContain('w-full')
      expect(trigger.classes()).not.toContain('inline-block')
    })
  })

  /**
   * Наведение переехало сюда из `GrDropdown`: режим открытия принадлежит
   * примитиву, он уже владеет `trigger`, и та же нужда есть у второго
   * компонента. Задержки нужны обе — без `openDelay` панель выпрыгивает на
   * любое пересечение курсором, без `closeDelay` её не удержать при переходе
   * с триггера на панель через зазор `offsetPx`.
   */
  describe('открытие по наведению', () => {
    it('без задержек открывается и закрывается сразу', async () => {
      const wrapper = mountPopover({ trigger: 'hover', openDelay: 0, closeDelay: 0 })
      const trigger = wrapper.get('[data-gr-popover-trigger]')

      await trigger.trigger('mouseenter')
      await nextTick()
      expect(panelEl()?.style.display).not.toBe('none')

      await trigger.trigger('mouseleave')
      await nextTick()
      expect(isClosed()).toBe(true)
    })

    it('клик в режиме наведения продолжает работать', async () => {
      // С клавиатуры и с тачскрина наведения не бывает: панель, открываемая
      // только курсором, для них не существует вовсе.
      const wrapper = mountPopover({ trigger: 'hover', openDelay: 0 })
      await trigger(wrapper).trigger('click')
      await nextTick()

      expect(panelEl()?.style.display).not.toBe('none')
    })

    it('в режиме клика наведение панель не открывает', async () => {
      const wrapper = mountPopover({ trigger: 'click', openDelay: 0 })
      await wrapper.get('[data-gr-popover-trigger]').trigger('mouseenter')
      await nextTick()

      expect(isClosed()).toBe(true)
    })

    it('`disabled` не открывается наведением', async () => {
      const wrapper = mountPopover({ trigger: 'hover', openDelay: 0, disabled: true })
      await wrapper.get('[data-gr-popover-trigger]').trigger('mouseenter')
      await nextTick()

      expect(isClosed()).toBe(true)
    })
  })

  /**
   * Клик триггера живёт в `triggerProps`, а не на обёртке слота.
   *
   * Обёртка ловит и клики по вложенным элементам: кнопка рядом с триггером,
   * ссылка в карточке-триггере, крестик на чипе открывали бы панель мимо
   * намерения пользователя. `GrDropdown` эту ошибку не повторял с самого начала.
   *
   * Обёртка при этом не онемела: слот без `v-bind="triggerProps"` до правки
   * открывался кликом по ней, и молча отнять это у тех, кто на это опирался,
   * нельзя. Она срабатывает ровно тогда, когда привязанного триггера внутри нет.
   */
  describe('клик по триггеру', () => {
    const NESTED = `<template #trigger="{ triggerProps }">
      <div><button v-bind="triggerProps" data-main>Открыть</button><button data-nested>Другое</button></div>
    </template>`

    function mountNested() {
      mounted = mount(GrPopover, {
        props: { ariaLabel: 'Панель' },
        slots: { trigger: NESTED, content: CONTENT },
        attachTo: document.body,
      })

      return mounted as ReturnType<typeof mountPopover>
    }

    it('вложенная кнопка панель не открывает', async () => {
      const wrapper = mountNested()

      await wrapper.get('[data-nested]').trigger('click')
      await nextTick()

      expect(isClosed()).toBe(true)
    })

    it('привязанный триггер — открывает', async () => {
      const wrapper = mountNested()

      await wrapper.get('[data-main]').trigger('click')
      await nextTick()

      expect(panelEl()?.style.display).not.toBe('none')
    })

    it('слот без `triggerProps` продолжает открываться кликом по обёртке', async () => {
      // Совместимость: так делали до правки, и это не должно перестать работать.
      mounted = mount(GrPopover, {
        props: { ariaLabel: 'Панель' },
        slots: { trigger: '<template #trigger><span data-bare>Открыть</span></template>', content: CONTENT },
        attachTo: document.body,
      })

      await (mounted as ReturnType<typeof mountPopover>).get('[data-gr-popover-trigger]').trigger('click')
      await nextTick()

      expect(panelEl()?.style.display).not.toBe('none')
    })

    it('привязанный триггер гасит запасной путь: одного клика хватает на один переключ', async () => {
      // Клик по кнопке всплывает и до обёртки. Сработай оба — панель открылась
      // бы и тут же закрылась, а пользователь увидел бы, что «кнопка не жмётся».
      const wrapper = mountNested()

      await wrapper.get('[data-main]').trigger('click')
      await nextTick()
      expect(panelEl()?.style.display).not.toBe('none')

      await wrapper.get('[data-main]').trigger('click')
      await nextTick()
      expect(isClosed()).toBe(true)
    })
  })

  /**
   * Геометрия панели относительно триггера.
   *
   * Проверки пришли из `GrDropdown`: пока он вёл собственное позиционирование,
   * они жили у него, а после переезда меню на этот примитив стали проверять его
   * работу через обёртку. Здесь они на месте — и покрытие не потерялось.
   */
  describe('позиционирование относительно триггера', () => {
    it('правый край панели совпадает с правым краем триггера при `bottom-end`', async () => {
      vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function mocked(this: HTMLElement) {
        const text = this.textContent ?? ''

        // Панель без измеренной ширины (0) не сдвигается влево — привязка идёт
        // по правому краю триггера, а не по вычисленной ширине панели.
        return text.includes('Открыть') && !text.includes('Внутри')
          ? rect(100, 20, 200, 32)
          : rect(0, 0, 0, 0)
      })

      const wrapper = mountPopover({ placement: 'bottom-end' })
      await trigger(wrapper).trigger('click')
      await nextTick()
      await flushFloatingUpdate()

      const panel = panelEl()

      expect(panel?.style.left).toBe('300px')
      expect(panel?.style.top).toBe('60px')
      expect(panel?.className).toContain('origin-top-right')
    })

    it('привязка идёт к триггеру, а не к растянутому layout-контейнеру', async () => {
      const wrapper = mountPopover({ placement: 'bottom-end' })

      const layoutContainer = wrapper.element as HTMLElement
      const triggerWrapper = wrapper.get('[data-gr-popover-trigger]').element as HTMLElement

      vi.spyOn(layoutContainer, 'getBoundingClientRect').mockImplementation(() => rect(0, 20, 900, 48))
      vi.spyOn(triggerWrapper, 'getBoundingClientRect').mockImplementation(() => rect(24, 20, 240, 40))

      await trigger(wrapper).trigger('click')
      await nextTick()
      await flushFloatingUpdate()

      const panel = panelEl()

      expect(panel?.style.left).toBe('264px')
      expect(panel?.style.top).toBe('68px')
      expect(panel?.className).toContain('origin-top-right')
    })
  })
})
