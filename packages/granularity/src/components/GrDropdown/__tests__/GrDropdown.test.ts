import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

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

  it('привязывает правый край панели к trigger без измерения ширины панели', async () => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function getBoundingClientRect(this: HTMLElement) {
      const text = this.textContent ?? ''

      if (text.includes('Открыть') && !text.includes('Элемент меню')) {
        return {
          x: 100,
          y: 20,
          top: 20,
          right: 300,
          bottom: 52,
          left: 100,
          width: 200,
          height: 32,
          toJSON: () => ({}),
        }
      }

      return {
        x: 0,
        y: 0,
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        width: 0,
        height: 0,
        toJSON: () => ({}),
      }
    })

    const wrapper = mount(GrDropdown, {
      attachTo: document.body,
      slots: {
        trigger: '<button type="button" data-testid="trigger" v-bind="params.triggerProps">Открыть</button>',
        content: '<div id="dropdown-content">Элемент меню</div>',
      },
    })

    await wrapper.get('[data-testid="trigger"]').trigger('click')
    await nextTick()
    await flushFloatingUpdate()

    const panel = document.body.querySelector<HTMLElement>('#dropdown-content')?.parentElement?.parentElement

    expect(panel).toBeTruthy()
    // `align='right'` (дефолт) → `placement='bottom-end'`: правый край панели совпадает
    // с правым краем триггера (300px), панель без измеренной ширины (0) не сдвигается влево.
    expect(panel?.style.left).toBe('300px')
    expect(panel?.style.top).toBe('60px')
    expect(panel?.className).toContain('origin-top-right')
  })

  it('привязывает панель к trigger, а не к растянутому layout-контейнеру', async () => {
    const wrapper = mount(GrDropdown, {
      attachTo: document.body,
      slots: {
        trigger: '<button type="button" data-testid="trigger" v-bind="params.triggerProps">Открыть</button>',
        content: '<div id="dropdown-content">Элемент меню</div>',
      },
    })

    const layoutContainer = wrapper.element as HTMLElement
    const triggerWrapper = wrapper.get('[data-testid="trigger"]').element.parentElement as HTMLElement

    vi.spyOn(layoutContainer, 'getBoundingClientRect').mockImplementation(() => rect(0, 20, 900, 48))
    vi.spyOn(triggerWrapper, 'getBoundingClientRect').mockImplementation(() => rect(24, 20, 240, 40))

    await wrapper.get('[data-testid="trigger"]').trigger('click')
    await nextTick()
    await flushFloatingUpdate()

    const panel = document.body.querySelector<HTMLElement>('#dropdown-content')?.parentElement?.parentElement

    expect(panel).toBeTruthy()
    expect(panel?.style.left).toBe('264px')
    expect(panel?.style.top).toBe('68px')
    expect(panel?.className).toContain('origin-top-right')
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
    expect(document.body.querySelector('[data-gr-dropdown-panel]')?.getAttribute('role')).toBe('menu')

    wrapper.unmount()
  })
})

describe('GrDropdown — триггер, размещение и ширина', () => {
  // В jsdom `offsetParent` всегда `null`, а компонент по нему отсеивает скрытые
  // пункты — без подмены список пунктов пуст и клавиатуре некуда вести фокус.
  let offsetParentSpy: PropertyDescriptor | undefined

  beforeEach(() => {
    offsetParentSpy = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetParent')
    Object.defineProperty(HTMLElement.prototype, 'offsetParent', {
      configurable: true,
      get() { return this.parentElement },
    })
  })

  afterEach(() => {
    if (offsetParentSpy)
      Object.defineProperty(HTMLElement.prototype, 'offsetParent', offsetParentSpy)

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

  function panelOpen(): boolean {
    const panel = document.body.querySelector<HTMLElement>('[data-gr-dropdown-panel]')
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

    await wrapper.get('[data-gr-dropdown-trigger]').trigger('mouseenter')
    await nextTick()
    expect(panelOpen()).toBe(false)

    wrapper.unmount()
  })

  it('trigger=hover открывает с задержкой и не закрывается при переходе курсора на панель', async () => {
    vi.useFakeTimers()
    const wrapper = await mountMenu({ trigger: 'hover', openDelay: 100, closeDelay: 150 })
    const triggerArea = wrapper.get('[data-gr-dropdown-trigger]')

    await triggerArea.trigger('mouseenter')
    expect(panelOpen()).toBe(false)

    vi.advanceTimersByTime(120)
    await nextTick()
    expect(panelOpen()).toBe(true)

    // Курсор ушёл с триггера, но пришёл на панель — закрытие отменяется.
    await triggerArea.trigger('mouseleave')
    const panel = document.body.querySelector<HTMLElement>('[data-gr-dropdown-panel]')!
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

    const panel = document.body.querySelector<HTMLElement>('[data-gr-dropdown-panel]')
    expect(panel?.className).toContain('origin-bottom-left')
    expect(panel?.style.left).toBe('40px')

    wrapper.unmount()
  })
})
