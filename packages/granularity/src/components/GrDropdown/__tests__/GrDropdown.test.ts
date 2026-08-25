import { mount } from '@vue/test-utils'
import { defineComponent, nextTick } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'

import GrDropdown from '../GrDropdown.vue'

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

// `@floating-ui/dom` вычисляет позицию асинхронно (внутренний `Promise`-платформ-слой,
// больше одного microtask-тика). Одного `nextTick()` не всегда хватает, чтобы дождаться
// финального `computePosition` — досыпаем через macrotask, который гарантированно
// выполняется после всех накопленных microtask'ов.
function flushFloatingUpdate(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0))
}

describe('GrDropdown', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    vi.restoreAllMocks()
  })

  it('рендерит выпадающую панель вне локального контейнера, чтобы её не обрезали родительские блоки', async () => {
    const wrapper = mount(GrDropdown, {
      attachTo: document.body,
      slots: {
        trigger: '<button type="button" data-testid="trigger" v-bind="params.triggerProps">Открыть</button>',
        content: '<div id="dropdown-content">Элемент меню</div>',
      },
    })

    await wrapper.get('[data-testid="trigger"]').trigger('click')
    await nextTick()

    const content = document.body.querySelector('#dropdown-content')

    expect(content).toBeTruthy()
    expect(wrapper.element.contains(content)).toBe(false)
  })

  it('телепортирует панель в указанный target вместо body', async () => {
    const target = document.createElement('div')
    target.id = 'dropdown-target'
    document.body.appendChild(target)

    const wrapper = mount(GrDropdown, {
      attachTo: document.body,
      props: {
        teleportTo: '#dropdown-target',
      },
      slots: {
        trigger: '<button type="button" data-testid="trigger" v-bind="params.triggerProps">Открыть</button>',
        content: '<div id="dropdown-content">Элемент меню</div>',
      },
    })

    await wrapper.get('[data-testid="trigger"]').trigger('click')
    await nextTick()

    const content = target.querySelector('#dropdown-content')

    expect(content).toBeTruthy()
    expect(document.body.querySelector('#dropdown-content')).toBe(content)
    expect(wrapper.element.contains(content)).toBe(false)
  })
})

describe('GrDropdown a11y (item 18)', () => {
  it('exposes triggerProps (aria-haspopup/expanded) and opens via keyboard', async () => {
    const { defineComponent } = await import('vue')
    const Harness = defineComponent({
      components: { GrDropdown },
      template: `
        <GrDropdown teleport-to="body">
          <template #trigger="{ triggerProps }">
            <button type="button" data-testid="trigger" v-bind="triggerProps">Open</button>
          </template>
          <template #content>
            <button type="button" data-testid="item-1" role="menuitem">One</button>
          </template>
        </GrDropdown>
      `,
    })
    const wrapper = mount(Harness, { attachTo: document.body })
    const trigger = wrapper.get('[data-testid="trigger"]')

    expect(trigger.attributes('aria-haspopup')).toBe('menu')
    expect(trigger.attributes('aria-expanded')).toBe('false')

    await trigger.trigger('keydown', { key: 'ArrowDown' })
    await nextTick()

    expect(trigger.attributes('aria-expanded')).toBe('true')
    expect(document.body.querySelector('[data-gr-popover-panel]')?.getAttribute('role')).toBe('menu')

    wrapper.unmount()
  })
})

describe('GrDropdown — триггер, размещение и ширина', () => {
  afterEach(() => {
    // Панели телепортируются в `body` и переживают unmount обёртки: без уборки
    // следующий тест нашёл бы чужую панель и проверил бы не то.
    document.body.innerHTML = ''
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  async function mountMenu(props: Record<string, unknown> = {}) {
    const { defineComponent } = await import('vue')
    const Harness = defineComponent({
      components: { GrDropdown },
      props: { dropdownProps: { type: Object, default: () => ({}) } },
      template: `
        <GrDropdown v-bind="dropdownProps" teleport-to="body">
          <template #trigger="{ triggerProps }">
            <span data-testid="wrapper-area">
              <button type="button" data-testid="trigger" v-bind="triggerProps">Меню</button>
              <button type="button" data-testid="nested">Вложенная</button>
            </span>
          </template>
          <template #content>
            <button type="button" data-testid="item-apple" role="menuitem">Apple</button>
            <button type="button" data-testid="item-avocado" role="menuitem">Avocado</button>
            <button type="button" data-testid="item-banana" role="menuitem">Banana</button>
          </template>
        </GrDropdown>
      `,
    })

    return mount(Harness, { attachTo: document.body, props: { dropdownProps: props } })
  }

  // Открыто/закрыто держит панель `GrPopover`, на которой стоит меню:
  // `v-show` принадлежит ей. `[data-gr-dropdown-panel]` — контейнер пунктов
  // внутри неё, он несёт ширину и клавиатуру.
  function panelOpen(): boolean {
    const panel = document.body.querySelector<HTMLElement>('[data-gr-popover-panel]')
    return Boolean(panel) && panel!.style.display !== 'none'
  }

  it('клик по вложенной кнопке в слоте #trigger не переключает панель, а клик по триггеру — переключает', async () => {
    const wrapper = await mountMenu()

    await wrapper.get('[data-testid="nested"]').trigger('click')
    await nextTick()
    expect(panelOpen()).toBe(false)

    await wrapper.get('[data-testid="trigger"]').trigger('click')
    await nextTick()
    expect(panelOpen()).toBe(true)

    wrapper.unmount()
  })

  it('предупреждает в dev-сборке, если triggerProps не привязан', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const wrapper = mount(GrDropdown, {
      attachTo: document.body,
      slots: {
        trigger: '<button type="button">Без биндинга</button>',
        content: '<div>Пункт</div>',
      },
    })

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('triggerProps'))

    wrapper.unmount()
  })

  it('typeahead ведёт фокус по первой букве, повтор буквы даёт следующий пункт', async () => {
    const wrapper = await mountMenu()

    await wrapper.get('[data-testid="trigger"]').trigger('keydown', { key: 'ArrowDown' })
    await nextTick()

    const panel = document.body.querySelector<HTMLElement>('[data-gr-dropdown-panel]')!
    const fire = (key: string) => panel.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }))

    fire('b')
    expect(document.activeElement?.getAttribute('data-testid')).toBe('item-banana')

    // Пауза сбрасывает буфер: иначе следующая буква продолжила бы «b…».
    await new Promise(resolve => setTimeout(resolve, 700))

    // Повтор одной буквы — «следующий на ту же букву», а не поиск «aa».
    fire('a')
    expect(document.activeElement?.getAttribute('data-testid')).toBe('item-apple')
    fire('a')
    expect(document.activeElement?.getAttribute('data-testid')).toBe('item-avocado')

    wrapper.unmount()
  })

  it('буфер typeahead копит буквы, пока не истечёт пауза', async () => {
    vi.useFakeTimers()
    const wrapper = await mountMenu()

    await wrapper.get('[data-testid="trigger"]').trigger('keydown', { key: 'ArrowDown' })
    await nextTick()

    const panel = document.body.querySelector<HTMLElement>('[data-gr-dropdown-panel]')!
    const fire = (key: string) => panel.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }))

    fire('a')
    fire('v')
    expect(document.activeElement?.getAttribute('data-testid')).toBe('item-avocado')

    // После паузы буфер пуст, и `a` снова означает «первый на A».
    vi.advanceTimersByTime(700)
    fire('a')
    expect(document.activeElement?.getAttribute('data-testid')).toBe('item-apple')

    wrapper.unmount()
    vi.useRealTimers()
  })

  it('disabled не даёт открыть панель ни кликом, ни клавиатурой, ни наведением', async () => {
    const wrapper = await mountMenu({ disabled: true, trigger: 'hover', openDelay: 0 })
    const trigger = wrapper.get('[data-testid="trigger"]')

    expect(trigger.attributes('aria-disabled')).toBe('true')

    await trigger.trigger('click')
    await nextTick()
    expect(panelOpen()).toBe(false)

    await trigger.trigger('keydown', { key: 'ArrowDown' })
    await nextTick()
    expect(panelOpen()).toBe(false)

    await wrapper.get('[data-gr-popover-trigger]').trigger('mouseenter')
    await nextTick()
    expect(panelOpen()).toBe(false)

    wrapper.unmount()
  })

  it('trigger=hover открывает с задержкой и не закрывается при переходе курсора на панель', async () => {
    vi.useFakeTimers()
    const wrapper = await mountMenu({ trigger: 'hover', openDelay: 100, closeDelay: 150 })
    const triggerArea = wrapper.get('[data-gr-popover-trigger]')

    await triggerArea.trigger('mouseenter')
    expect(panelOpen()).toBe(false)

    vi.advanceTimersByTime(120)
    await nextTick()
    expect(panelOpen()).toBe(true)

    // Курсор ушёл с триггера, но пришёл на панель — закрытие отменяется.
    await triggerArea.trigger('mouseleave')
    const panel = document.body.querySelector<HTMLElement>('[data-gr-popover-panel]')!
    panel.dispatchEvent(new MouseEvent('mouseenter', { bubbles: false }))
    vi.advanceTimersByTime(200)
    await nextTick()
    expect(panelOpen()).toBe(true)

    // А уход с самой панели закрывает.
    panel.dispatchEvent(new MouseEvent('mouseleave', { bubbles: false }))
    vi.advanceTimersByTime(200)
    await nextTick()
    expect(panelOpen()).toBe(false)

    wrapper.unmount()
    vi.useRealTimers()
  })

  it('width доезжает до инлайн-стиля панели, auto оставляет ширину контенту', async () => {
    const px = await mountMenu({ width: 240 })
    await px.get('[data-testid="trigger"]').trigger('click')
    await nextTick()
    expect(document.body.querySelector<HTMLElement>('[data-gr-dropdown-panel]')?.style.width).toBe('240px')
    px.unmount()

    const rem = await mountMenu({ width: '18rem' })
    await rem.get('[data-testid="trigger"]').trigger('click')
    await nextTick()
    expect(document.body.querySelector<HTMLElement>('[data-gr-dropdown-panel]')?.style.width).toBe('18rem')
    rem.unmount()

    const auto = await mountMenu({ width: 'auto' })
    await auto.get('[data-testid="trigger"]').trigger('click')
    await nextTick()
    expect(document.body.querySelector<HTMLElement>('[data-gr-dropdown-panel]')?.style.width).toBe('')
    auto.unmount()
  })

  it('строка без единиц ругается в dev: 48 — это уже не w-48', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const wrapper = await mountMenu({ width: '48' })
    await wrapper.get('[data-testid="trigger"]').trigger('click')
    await nextTick()

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('трактуется как 48px'))
    expect(document.body.querySelector<HTMLElement>('[data-gr-dropdown-panel]')?.style.width).toBe('48px')

    wrapper.unmount()
  })

  it('placement уходит в позиционирование и задаёт transform-origin', async () => {
    // Триггер внизу экрана: иначе `flip` сам развернёт панель вниз, и проверка
    // говорила бы о нехватке места, а не о том, что проп доехал.
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function mocked(this: HTMLElement) {
      return (this.textContent ?? '').includes('Меню') && !(this.textContent ?? '').includes('Apple')
        ? rect(40, 700, 120, 32)
        : rect(0, 0, 0, 0)
    })

    const wrapper = await mountMenu({ placement: 'top-start' })

    await wrapper.get('[data-testid="trigger"]').trigger('click')
    await nextTick()
    await flushFloatingUpdate()

    // Проп доехал до позиционирования: `transform-origin` считает `GrPopover`,
    // на панели которого меню и стоит. Здесь проверяется именно проброс.
    const panel = document.body.querySelector<HTMLElement>('[data-gr-popover-panel]')
    expect(panel?.className).toContain('origin-bottom-left')
    expect(panel?.style.left).toBe('40px')

    wrapper.unmount()
  })
})

describe('GrDropdown — кольцо фокуса внутри панели', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    vi.restoreAllMocks()
  })

  /** Открывает панель с клавиатуры: фокус сразу на первом пункте кольца. */
  async function mountPanel(content: string) {
    const Harness = defineComponent({
      components: { GrDropdown },
      template: `
        <GrDropdown teleport-to="body">
          <template #trigger="{ triggerProps }">
            <button type="button" data-testid="trigger" v-bind="triggerProps">Меню</button>
          </template>
          <template #content>${content}</template>
        </GrDropdown>
      `,
    })

    const wrapper = mount(Harness, { attachTo: document.body })
    await wrapper.get('[data-testid="trigger"]').trigger('keydown', { key: 'ArrowDown' })
    await nextTick()

    return wrapper
  }

  const MENU = `
    <button type="button" data-testid="item-apple" role="menuitem" tabindex="-1">Apple</button>
    <button type="button" data-testid="item-banana" role="menuitem" tabindex="-1">Banana</button>
    <button type="button" data-testid="item-cherry" role="menuitem" tabindex="-1">Cherry</button>
  `

  /** Клавиша с конкретной цели: перехват решается по `event.target`. */
  function press(target: Element, key: string): KeyboardEvent {
    const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
    target.dispatchEvent(event)
    return event
  }

  function focused(): string | null | undefined {
    return document.activeElement?.getAttribute('data-testid')
  }

  function panelOf(): HTMLElement {
    return document.body.querySelector<HTMLElement>('[data-gr-dropdown-panel]')!
  }

  it('↓/↑ ходят по кругу, Home/End бросают к краям', async () => {
    const wrapper = await mountPanel(MENU)
    const panel = panelOf()

    expect(focused()).toBe('item-apple')

    press(panel, 'ArrowDown')
    expect(focused()).toBe('item-banana')

    press(panel, 'ArrowUp')
    expect(focused()).toBe('item-apple')

    // Кольцо, а не отрезок: с первого вверх — на последний.
    press(panel, 'ArrowUp')
    expect(focused()).toBe('item-cherry')

    press(panel, 'ArrowDown')
    expect(focused()).toBe('item-apple')

    press(panel, 'End')
    expect(focused()).toBe('item-cherry')

    press(panel, 'Home')
    expect(focused()).toBe('item-apple')

    wrapper.unmount()
  })

  it('Tab закрывает панель, а не уводит фокус по таб-порядку', async () => {
    const wrapper = await mountPanel(MENU)

    press(panelOf(), 'Tab')
    await nextTick()

    // Клавиша адресована контейнеру пунктов, а `v-show` — панели поповера, на
    // которой меню стоит.
    expect(document.body.querySelector<HTMLElement>('[data-gr-popover-panel]')!.style.display).toBe('none')

    wrapper.unmount()
  })

  it('пункт с aria-disabled остаётся в кольце, нативно disabled — выпадает', async () => {
    const wrapper = await mountPanel(`
      <button type="button" data-testid="item-apple" role="menuitem" tabindex="-1">Apple</button>
      <button type="button" data-testid="item-off" role="menuitem" tabindex="-1" aria-disabled="true">Off</button>
      <button type="button" data-testid="item-native-off" role="menuitem" tabindex="-1" disabled>Native</button>
      <button type="button" data-testid="item-cherry" role="menuitem" tabindex="-1">Cherry</button>
    `)
    const panel = panelOf()

    // `aria-disabled` оставляет пункт фокусируемым намеренно: пользователь
    // узнаёт, что действие есть, но сейчас недоступно (WAI-ARIA APG).
    press(panel, 'ArrowDown')
    expect(focused()).toBe('item-off')

    // Нативный `disabled` браузер не фокусирует — в кольце ему делать нечего.
    press(panel, 'ArrowDown')
    expect(focused()).toBe('item-cherry')

    wrapper.unmount()
  })

  it('скрытый пункт выпадает из кольца', async () => {
    // Скрыт сам элемент, а не предок: в jsdom нет раскладки, и общий сборщик
    // фокусируемых честно смотрит только на собственные стили элемента.
    const wrapper = await mountPanel(`
      <button type="button" data-testid="item-apple" role="menuitem" tabindex="-1">Apple</button>
      <button type="button" data-testid="item-hidden" role="menuitem" tabindex="-1" hidden>Hidden</button>
      <button type="button" data-testid="item-none" role="menuitem" tabindex="-1" style="display: none">None</button>
      <button type="button" data-testid="item-cherry" role="menuitem" tabindex="-1">Cherry</button>
    `)

    press(panelOf(), 'ArrowDown')
    expect(focused()).toBe('item-cherry')

    wrapper.unmount()
  })

  it('поле внутри панели попадает в кольцо, и печатать в нём можно', async () => {
    const wrapper = await mountPanel(`
      <input data-testid="query">
      <button type="button" data-testid="item-banana" role="menuitem" tabindex="-1">Banana</button>
    `)
    const panel = panelOf()

    // Раньше `input` в кольцо не входил: до поля внутри панели было не добраться
    // ни стрелками, ни табом — тот панель закрывает.
    expect(focused()).toBe('query')

    const input = document.body.querySelector<HTMLInputElement>('[data-testid="query"]')!
    const typed = press(input, 'b')

    expect(typed.defaultPrevented).toBe(false)
    expect(focused()).toBe('query')

    // Стрелки — исключение: они остаются за меню, иначе из поля нет выхода.
    press(input, 'ArrowDown')
    expect(focused()).toBe('item-banana')

    // Та же буква с пункта — уже typeahead, а не ввод.
    const search = press(panel, 'b')
    expect(search.defaultPrevented).toBe(true)

    wrapper.unmount()
  })

  it('Home/End в поле двигают каретку, а не фокус', async () => {
    const wrapper = await mountPanel(`
      <input data-testid="query">
      <button type="button" data-testid="item-banana" role="menuitem" tabindex="-1">Banana</button>
    `)

    const input = document.body.querySelector<HTMLInputElement>('[data-testid="query"]')!

    const home = press(input, 'End')
    expect(home.defaultPrevented).toBe(false)
    expect(focused()).toBe('query')

    wrapper.unmount()
  })

  it('пробел достаётся чекбоксу и кнопке-пункту, но входит в непустой буфер', async () => {
    const wrapper = await mountPanel(`
      <input type="checkbox" data-testid="flag">
      <button type="button" data-testid="item-banana" role="menuitem" tabindex="-1">Banana</button>
      <button type="button" data-testid="item-b-c" role="menuitem" tabindex="-1">B C</button>
    `)
    const panel = panelOf()

    const checkbox = document.body.querySelector<HTMLInputElement>('[data-testid="flag"]')!
    const toggle = press(checkbox, ' ')

    // Перехваченный пробел не давал переключить чекбокс внутри панели вовсе.
    expect(toggle.defaultPrevented).toBe(false)

    // На кнопке-пункте пробел — нативная активация, пока поиск не начат.
    const item = document.body.querySelector<HTMLElement>('[data-testid="item-banana"]')!
    item.focus()
    expect(press(item, ' ').defaultPrevented).toBe(false)

    // А в начатом поиске пробел — часть запроса: «b c» находит «B C».
    press(panel, 'b')
    const inSearch = press(panel, ' ')
    expect(inSearch.defaultPrevented).toBe(true)
    press(panel, 'c')
    expect(focused()).toBe('item-b-c')

    wrapper.unmount()
  })
})

describe('GrDropdown — императивный API', () => {
  it('open/close/toggle правят собственное состояние: модели у меню нет', async () => {
    const wrapper = mount(GrDropdown, {
      slots: { trigger: '<button data-testid="trigger">Меню</button>', default: '<div>пункт</div>' },
      attachTo: document.body,
    })
    const api = wrapper.vm as unknown as { open: () => void, close: () => void, toggle: () => void }

    api.open()
    await nextTick()
    expect(document.body.querySelector('[data-gr-dropdown-panel]')).not.toBeNull()

    api.close()
    await nextTick()
    expect(wrapper.find('[data-gr-dropdown-panel]').exists()).toBe(false)

    wrapper.unmount()
  })

  it('заблокированное меню императивом не открыть', async () => {
    const wrapper = mount(GrDropdown, {
      props: { disabled: true },
      slots: { trigger: '<button data-testid="trigger">Меню</button>', default: '<div>пункт</div>' },
      attachTo: document.body,
    })

    ;(wrapper.vm as unknown as { open: () => void }).open()
    await nextTick()

    // Иначе императивный вызов обходил бы `disabled`, который держит клик и клавиатуру.
    expect(wrapper.find('[data-gr-dropdown-panel]').exists()).toBe(false)
    wrapper.unmount()
  })
})

describe('GrDropdown — v-model:open', () => {
  function mountDropdown(props: Record<string, unknown> = {}) {
    return mount(GrDropdown, {
      attachTo: document.body,
      props,
      slots: {
        trigger: '<button type="button" data-testid="trigger" v-bind="params.triggerProps">Открыть</button>',
        content: '<div id="dropdown-content">Пункт</div>',
      },
    })
  }

  function isPanelVisible(): boolean {
    const content = document.querySelector<HTMLElement>('#dropdown-content')
    return Boolean(content) && content!.closest('[style*="display: none"]') === null
  }

  it('`:open="true"` показывает панель без клика', async () => {
    const wrapper = mountDropdown({ open: true })
    await nextTick()

    expect(isPanelVisible()).toBe(true)
    wrapper.unmount()
  })

  it('uncontrolled: открытие кликом эмитит `update:open`', async () => {
    const wrapper = mountDropdown()

    await wrapper.get('[data-testid="trigger"]').trigger('click')

    expect(isPanelVisible()).toBe(true)
    expect(wrapper.emitted('update:open')?.at(-1)).toEqual([true])
    wrapper.unmount()
  })

  it('в controlled-режиме состоянием владеет родитель', async () => {
    const wrapper = mountDropdown({ open: false })

    await wrapper.get('[data-testid="trigger"]').trigger('click')

    expect(wrapper.emitted('update:open')?.at(-1)).toEqual([true])
    expect(isPanelVisible()).toBe(false)

    await wrapper.setProps({ open: true })
    expect(isPanelVisible()).toBe(true)
    wrapper.unmount()
  })
})
