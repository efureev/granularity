import { mount } from '@vue/test-utils'
import { defineComponent, nextTick, ref } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'

import { useFocusTrap } from '../useFocusTrap'

/**
 * Ловушка живёт на `keydown` и `focusin` документа, поэтому тесты работают с
 * настоящим DOM: `attachTo` обязателен, иначе `focus()` в jsdom не сработает.
 */
function mountTrap(options: {
  active?: boolean
  initialFocus?: boolean
  restoreFocus?: boolean
  extraContainer?: HTMLElement
} = {}) {
  const Harness = defineComponent({
    props: {
      active: { type: Boolean, default: true },
      useInitialFocus: { type: Boolean, default: false },
      restoreFocus: { type: Boolean, default: false },
      extra: { type: Object, default: null },
    },
    setup(props) {
      const container = ref<HTMLElement | null>(null)
      const second = ref<HTMLElement | null>(null)

      useFocusTrap(container, {
        active: () => props.active,
        initialFocus: () => (props.useInitialFocus ? second.value : null),
        fallbackFocus: () => container.value,
        containers: () => (props.extra ? [props.extra as HTMLElement] : []),
        restoreFocus: props.restoreFocus,
      })

      return { container, second }
    },
    template: `
      <div ref="container" tabindex="-1" data-testid="container">
        <button data-testid="first">first</button>
        <button ref="second" data-testid="second">second</button>
        <button data-testid="last">last</button>
      </div>
    `,
  })

  return mount(Harness, {
    attachTo: document.body,
    props: {
      active: options.active ?? true,
      useInitialFocus: options.initialFocus ?? false,
      restoreFocus: options.restoreFocus ?? false,
      extra: (options.extraContainer ?? null) as unknown as Record<string, unknown>,
    },
  })
}

const byId = (id: string) => document.querySelector<HTMLElement>(`[data-testid="${id}"]`)!

function pressTab(shiftKey = false): void {
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey, bubbles: true }))
}

/**
 * Отдельно от `pressTab`, потому что здесь важен не итоговый фокус, а сам факт
 * `preventDefault`: в jsdom Tab фокус не двигает вовсе, поэтому «ловушка не
 * мешает браузеру» проверяется только по гашению события.
 */
function pressTabAndTellIfPrevented(shiftKey = false): boolean {
  const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey, bubbles: true, cancelable: true })
  document.dispatchEvent(event)
  return event.defaultPrevented
}

describe('useFocusTrap', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('при активации уводит фокус на первый фокусируемый', async () => {
    const wrapper = mountTrap()
    // Ловушка включается, когда появился контейнер, и фокусирует следующим тиком.
    await nextTick()
    await nextTick()

    expect(document.activeElement).toBe(byId('first'))

    wrapper.unmount()
  })

  it('`initialFocus` перебивает первый фокусируемый', async () => {
    const wrapper = mountTrap({ initialFocus: true })
    await nextTick()
    await nextTick()

    expect(document.activeElement).toBe(byId('second'))

    wrapper.unmount()
  })

  it('не трогает фокус, уже стоящий внутри слоя', async () => {
    const outside = document.createElement('button')
    document.body.appendChild(outside)

    const wrapper = mountTrap({ active: false })
    byId('last').focus()

    await wrapper.setProps({ active: true })
    await nextTick()

    // Диалог наводит фокус на свою кнопку в тот же такт — ловушка это уважает.
    expect(document.activeElement).toBe(byId('last'))

    wrapper.unmount()
    outside.remove()
  })

  it('Tab с последнего элемента возвращает на первый, Shift+Tab — наоборот', async () => {
    const wrapper = mountTrap()
    await nextTick()

    byId('last').focus()
    pressTab()
    expect(document.activeElement).toBe(byId('first'))

    pressTab(true)
    expect(document.activeElement).toBe(byId('last'))

    wrapper.unmount()
  })

  it('в середине списка Tab не перехватывается — обход ведёт браузер', async () => {
    const wrapper = mountTrap()
    await nextTick()

    byId('first').focus()
    expect(pressTabAndTellIfPrevented(), 'Tab с первого элемента вперёд гасить нечего').toBe(false)

    byId('second').focus()
    expect(pressTabAndTellIfPrevented()).toBe(false)
    expect(pressTabAndTellIfPrevented(true), 'Shift+Tab из середины — тоже браузеру').toBe(false)

    byId('last').focus()
    expect(pressTabAndTellIfPrevented(true)).toBe(false)

    // Границы, наоборот, обязаны гаситься: иначе фокус ушёл бы за пределы слоя.
    byId('last').focus()
    expect(pressTabAndTellIfPrevented()).toBe(true)
    byId('first').focus()
    expect(pressTabAndTellIfPrevented(true)).toBe(true)

    wrapper.unmount()
  })

  it('Tab с самого контейнера заходит внутрь, а не выпрыгивает наружу', async () => {
    const wrapper = mountTrap()
    await nextTick()

    byId('container').focus()
    pressTab()
    expect(document.activeElement).toBe(byId('first'))

    byId('container').focus()
    pressTab(true)
    expect(document.activeElement).toBe(byId('last'))

    wrapper.unmount()
  })

  it('фокус, ушедший наружу, возвращается на последнее место внутри', async () => {
    const outside = document.createElement('button')
    document.body.appendChild(outside)

    const wrapper = mountTrap()
    await nextTick()

    byId('second').focus()
    outside.focus()

    expect(document.activeElement).toBe(byId('second'))

    wrapper.unmount()
    outside.remove()
  })

  it('дополнительные контейнеры считаются частью слоя', async () => {
    const panel = document.createElement('div')
    panel.innerHTML = '<button data-testid="option">option</button>'
    document.body.appendChild(panel)

    const wrapper = mountTrap({ extraContainer: panel })
    await nextTick()
    await nextTick()

    // Так ведёт себя панель селекта, открытого внутри модалки: она
    // телепортирована в `body`, но принадлежит тому же слою.
    byId('option').focus()
    expect(document.activeElement).toBe(byId('option'))

    // И круг Tab считается по обоим контейнерам: панель добавлена в `body`
    // раньше приложения, поэтому её кнопка — первая в порядке документа.
    pressTab(true)
    expect(document.activeElement).toBe(byId('last'))

    wrapper.unmount()
    panel.remove()
  })

  it('пока не активна, фокус не удерживает', async () => {
    const outside = document.createElement('button')
    document.body.appendChild(outside)

    const wrapper = mountTrap({ active: false })
    await nextTick()

    outside.focus()
    expect(document.activeElement).toBe(outside)

    wrapper.unmount()
    outside.remove()
  })

  it('с `restoreFocus` возвращает фокус туда, где он был до активации', async () => {
    const trigger = document.createElement('button')
    document.body.appendChild(trigger)
    trigger.focus()

    const wrapper = mountTrap({ active: false, restoreFocus: true })
    await wrapper.setProps({ active: true })
    await nextTick()
    expect(document.activeElement).toBe(byId('first'))

    await wrapper.setProps({ active: false })
    await nextTick()
    expect(document.activeElement).toBe(trigger)

    wrapper.unmount()
    trigger.remove()
  })

  it('снимает слушатели при размонтировании', async () => {
    const outside = document.createElement('button')
    document.body.appendChild(outside)

    const wrapper = mountTrap()
    await nextTick()
    wrapper.unmount()

    outside.focus()
    expect(document.activeElement).toBe(outside)

    outside.remove()
  })
})
