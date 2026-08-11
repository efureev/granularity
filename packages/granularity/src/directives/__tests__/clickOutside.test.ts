import { mount } from '@vue/test-utils'
import { defineComponent, nextTick, ref } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { vClickOutside } from '../clickOutside'

/**
 * Первые тесты директивы: до этого её поведение держалось только на тестах
 * `GrSelect`/`GrDropdown`, где она — деталь реализации. Ни `exclude`, ни игнор
 * неосновной кнопки, ни снятие слушателя при размонтировании не проверялись.
 */

function mountPanel(options: {
  binding: unknown
  withExclude?: boolean
}) {
  const Harness = defineComponent({
    directives: { clickOutside: vClickOutside },
    props: { binding: { type: null, required: true }, withExclude: Boolean },
    template: `
      <div>
        <button data-testid="exclude" ref="excludeEl">exclude</button>
        <div v-click-outside="binding" data-testid="panel">
          <button data-testid="inside">inside</button>
        </div>
      </div>
    `,
  })

  return mount(Harness, {
    attachTo: document.body,
    props: { binding: options.binding, withExclude: options.withExclude ?? false },
  })
}

/** Настоящий клик: директива слушает документ, а не элемент. */
function clickOn(element: Element, init: MouseEventInit = {}): void {
  element.dispatchEvent(new MouseEvent('click', { bubbles: true, button: 0, ...init }))
}

const outside = () => document.body

afterEach(() => {
  document.body.innerHTML = ''
})

describe('vClickOutside', () => {
  it('зовёт обработчик на клик вне элемента и молчит на клик внутри', () => {
    const handler = vi.fn()
    const wrapper = mountPanel({ binding: handler })

    clickOn(wrapper.get('[data-testid="inside"]').element)
    expect(handler).not.toHaveBeenCalled()

    clickOn(outside())
    expect(handler).toHaveBeenCalledTimes(1)

    wrapper.unmount()
  })

  it('exclude принимает элемент, селектор и геттер', async () => {
    for (const excludeOf of [
      (el: HTMLElement) => el,
      () => '[data-testid="exclude"]',
      (el: HTMLElement) => () => el,
    ]) {
      const handler = vi.fn()
      const wrapper = mountPanel({ binding: handler })
      const excludeEl = wrapper.get('[data-testid="exclude"]').element as HTMLElement

      // Биндинг обновляем после монтирования: так же это делает потребитель,
      // у которого триггер появляется позже панели.
      // `await` обязателен: биндинг доезжает до директивы хуком `updated`.
      await wrapper.setProps({ binding: { handler, exclude: [excludeOf(excludeEl)] } })

      clickOn(excludeEl)
      expect(handler, `exclude как ${typeof excludeOf(excludeEl)}`).not.toHaveBeenCalled()

      clickOn(outside())
      expect(handler).toHaveBeenCalledTimes(1)

      wrapper.unmount()
    }
  })

  it('enabled: false выключает директиву, не снимая её с элемента', async () => {
    const handler = vi.fn()
    const wrapper = mountPanel({ binding: { handler, enabled: false } })

    clickOn(outside())
    expect(handler).not.toHaveBeenCalled()

    await wrapper.setProps({ binding: { handler, enabled: true } })
    clickOn(outside())
    expect(handler).toHaveBeenCalledTimes(1)

    wrapper.unmount()
  })

  it('неосновная кнопка мыши не считается кликом', () => {
    const handler = vi.fn()
    const wrapper = mountPanel({ binding: handler })

    clickOn(outside(), { button: 2 })
    expect(handler).not.toHaveBeenCalled()

    clickOn(outside(), { button: 0 })
    expect(handler).toHaveBeenCalledTimes(1)

    wrapper.unmount()
  })

  it('обновление биндинга не двоит вызовы, размонтирование снимает слушатель', async () => {
    const handler = vi.fn()
    const wrapper = mountPanel({ binding: { handler } })

    // `updated` перевешивает слушатели — если бы старый не снимался, вызовов было бы два.
    await wrapper.setProps({ binding: { handler, capture: false } })
    await nextTick()

    clickOn(outside())
    expect(handler).toHaveBeenCalledTimes(1)

    wrapper.unmount()
    clickOn(outside())
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('события настраиваются: mousedown вместо click', () => {
    const handler = vi.fn()
    const wrapper = mountPanel({ binding: { handler, events: ['mousedown'] } })

    clickOn(outside())
    expect(handler).not.toHaveBeenCalled()

    document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 0 }))
    expect(handler).toHaveBeenCalledTimes(1)

    wrapper.unmount()
  })

  it('вложенная панель: клик по внутренней не закрывает внешнюю через exclude', () => {
    const outerHandler = vi.fn()
    const innerEl = ref<HTMLElement | null>(null)

    const Harness = defineComponent({
      directives: { clickOutside: vClickOutside },
      setup() {
        return { innerEl, outerHandler }
      },
      template: `
        <div>
          <div v-click-outside="{ handler: outerHandler, exclude: [() => innerEl] }" data-testid="outer">
            outer
          </div>
          <div ref="innerEl" data-testid="inner">inner</div>
        </div>
      `,
    })

    const wrapper = mount(Harness, { attachTo: document.body })

    clickOn(wrapper.get('[data-testid="inner"]').element)
    expect(outerHandler).not.toHaveBeenCalled()

    clickOn(outside())
    expect(outerHandler).toHaveBeenCalledTimes(1)

    wrapper.unmount()
  })
})
