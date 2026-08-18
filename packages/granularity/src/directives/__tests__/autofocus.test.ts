import { mount } from '@vue/test-utils'
import { defineComponent, nextTick } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { resetGranularityDom } from '../../testing'
import { vAutofocus } from '../autofocus'

import type { AutofocusBindingValue } from '../autofocus'

/**
 * Тесты `v-autofocus`.
 *
 * Директива откладывает фокус дважды — `nextTick`, затем кадр, — потому что
 * внутреннее поле обёртки появляется позже её самой. Поэтому проверять сразу
 * после монтирования бесполезно: нужен `flush()`, и он же объясняет, почему
 * тестов у директивы не было.
 */

const Harness = defineComponent({
  name: 'HarnessAutofocus',
  directives: { autofocus: vAutofocus },
  props: {
    binding: { type: [Boolean, String, Object] as unknown as () => AutofocusBindingValue, default: true },
    wrapped: { type: Boolean, default: false },
  },
  template: `
    <div v-if="wrapped" v-autofocus="binding" data-wrapper>
      <span data-decoy>не фокусируется</span>
      <input data-inner>
    </div>
    <input v-else v-autofocus="binding" data-self>
  `,
})

/** Отложенный фокус доезжает через тик и кадр — ждём оба, с запасом. */
async function flush(): Promise<void> {
  await nextTick()
  await nextTick()
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  })
}

function mountHarness(props: Record<string, unknown> = {}) {
  return mount(Harness, { props, attachTo: document.body })
}

afterEach(() => {
  resetGranularityDom()
})

describe('vAutofocus', () => {
  it('фокусирует сам элемент, если он подходит под селектор', async () => {
    const wrapper = mountHarness()
    await flush()

    expect(document.activeElement).toBe(wrapper.get('[data-self]').element)

    wrapper.unmount()
  })

  it('в обёртке фокусирует вложенное поле, а не саму обёртку', async () => {
    const wrapper = mountHarness({ wrapped: true })
    await flush()

    expect(document.activeElement).toBe(wrapper.get('[data-inner]').element)

    wrapper.unmount()
  })

  // Оборотная сторона: без выключателя директива бесполезна в списках и
  // условных формах, где автофокус нужен ровно одному элементу из многих.
  it.each([false, { disabled: true }] as AutofocusBindingValue[])(
    'выключенная директива (%s) фокус не ставит',
    async (binding) => {
      const wrapper = mountHarness({ binding })
      await flush()

      expect(document.activeElement).toBe(document.body)

      wrapper.unmount()
    },
  )

  it('строковый биндинг читается как селектор', async () => {
    const wrapper = mountHarness({ wrapped: true, binding: '[data-decoy]' })
    await flush()

    // `span` не фокусируемый: важно, что директива взяла именно указанный узел
    // и не сползла на дефолтный селектор, где нашлось бы поле.
    expect(document.activeElement).not.toBe(wrapper.get('[data-inner]').element)

    wrapper.unmount()
  })

  it('preventScroll прокидывается в focus', async () => {
    const wrapper = mountHarness()
    const el = wrapper.get('[data-self]').element as HTMLInputElement
    const focus = vi.spyOn(el, 'focus')

    await flush()

    expect(focus).toHaveBeenCalledWith({ preventScroll: true })

    focus.mockRestore()
    wrapper.unmount()
  })

  /**
   * Браузер без `FocusOptions` не должен остаться без фокуса вовсе.
   *
   * Ветка `catch` в директиве — не украшение: если `focus(options)` бросает, а
   * отката нет, автофокус тихо исчезает на всём таком браузере.
   */
  it('падение focus(options) откатывается на focus() без аргументов', async () => {
    const wrapper = mountHarness()
    const el = wrapper.get('[data-self]').element as HTMLInputElement

    const focus = vi.spyOn(el, 'focus').mockImplementation((options?: FocusOptions) => {
      if (options !== undefined) throw new TypeError('FocusOptions не поддержан')
    })

    await flush()

    expect(focus).toHaveBeenCalledTimes(2)
    expect(focus).toHaveBeenNthCalledWith(1, { preventScroll: true })
    expect(focus).toHaveBeenNthCalledWith(2)

    focus.mockRestore()
    wrapper.unmount()
  })
})
