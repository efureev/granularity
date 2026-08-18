import { mount } from '@vue/test-utils'
import { defineComponent, nextTick } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'

import { resetGranularityDom } from '../../testing'
import { vAutosize } from '../autosize'

import type { AutosizeBindingValue } from '../autosize'

/**
 * Тесты `v-autosize`.
 *
 * **Границу видно сразу:** в jsdom раскладки нет, и `scrollHeight` у `textarea`
 * всегда `0`. Поэтому «высота выросла вместе с текстом» здесь недоказуемо —
 * это вопрос к браузеру, а не к директиве. Проверяемо всё остальное, и оно же
 * ломается чаще: `overflowY` не восстановился, слушатель не снялся, подменённая
 * внутри обёртки `textarea` осталась без подписки. Арифметику высоты проверяем,
 * подменив `scrollHeight` — так утверждается формула, а не поведение движка.
 */

const Harness = defineComponent({
  name: 'HarnessAutosize',
  directives: { autosize: vAutosize },
  props: {
    binding: { type: [Boolean, Object] as unknown as () => AutosizeBindingValue, default: true },
    wrapped: { type: Boolean, default: false },
    swapped: { type: Boolean, default: false },
  },
  template: `
    <div v-if="wrapped" v-autosize="binding" data-wrapper>
      <textarea v-if="swapped" data-second></textarea>
      <textarea v-else data-first></textarea>
    </div>
    <textarea v-else v-autosize="binding" data-self></textarea>
  `,
})

/** В jsdom `scrollHeight` всегда 0 — подменяем, чтобы проверить формулу. */
function stubScrollHeight(el: Element, value: number): void {
  Object.defineProperty(el, 'scrollHeight', { configurable: true, get: () => value })
}

function mountHarness(props: Record<string, unknown> = {}) {
  return mount(Harness, { props, attachTo: document.body })
}

afterEach(() => {
  resetGranularityDom()
})

describe('vAutosize', () => {
  it('на монтировании гасит скролл, на размонтировании возвращает прежний', () => {
    const wrapper = mountHarness()
    const textarea = wrapper.get('[data-self]').element as HTMLTextAreaElement

    expect(textarea.style.overflowY).toBe('hidden')

    wrapper.unmount()

    // Директива не «сбрасывает в пусто», а возвращает то, что было: свой
    // `overflow-y` у потребителя пережить её обязан.
    expect(textarea.style.overflowY).toBe('')
  })

  it('пересчитывает высоту на input и перестаёт после размонтирования', async () => {
    const wrapper = mountHarness()
    const textarea = wrapper.get('[data-self]').element as HTMLTextAreaElement

    stubScrollHeight(textarea, 80)
    textarea.dispatchEvent(new Event('input'))
    expect(textarea.style.height).toBe('80px')

    wrapper.unmount()

    // Обратная сторона: слушатель снят — новый `input` уже ничего не меняет.
    stubScrollHeight(textarea, 300)
    textarea.dispatchEvent(new Event('input'))
    expect(textarea.style.height).toBe('80px')
  })

  it('в border-box к высоте прибавляются бордеры, в content-box — нет', () => {
    const wrapper = mountHarness()
    const textarea = wrapper.get('[data-self]').element as HTMLTextAreaElement

    stubScrollHeight(textarea, 100)

    textarea.style.boxSizing = 'content-box'
    textarea.dispatchEvent(new Event('input'))
    expect(textarea.style.height).toBe('100px')

    textarea.style.boxSizing = 'border-box'
    textarea.style.borderTopWidth = '2px'
    textarea.style.borderBottomWidth = '3px'
    textarea.dispatchEvent(new Event('input'))
    expect(textarea.style.height).toBe('105px')

    wrapper.unmount()
  })

  it('на обёртке находит вложенную textarea', () => {
    const wrapper = mountHarness({ wrapped: true })
    const textarea = wrapper.get('[data-first]').element as HTMLTextAreaElement

    expect(textarea.style.overflowY).toBe('hidden')

    wrapper.unmount()
  })

  /**
   * Подмена поля внутри обёртки — самый дорогой сценарий.
   *
   * `v-if` в шаблоне потребителя меняет `textarea` на другой узел, а директива
   * остаётся на той же обёртке. Не переподписаться значит потерять автоподстройку
   * молча: старый слушатель висит на выброшенном узле, новый не заведён.
   */
  it('после подмены textarea подписка переезжает на новый узел', async () => {
    const wrapper = mountHarness({ wrapped: true })
    const first = wrapper.get('[data-first]').element as HTMLTextAreaElement

    await wrapper.setProps({ swapped: true })
    await nextTick()

    const second = wrapper.get('[data-second]').element as HTMLTextAreaElement

    expect(second.style.overflowY).toBe('hidden')

    stubScrollHeight(second, 64)
    second.dispatchEvent(new Event('input'))
    expect(second.style.height).toBe('64px')

    stubScrollHeight(first, 999)
    first.dispatchEvent(new Event('input'))
    expect(first.style.height).not.toBe('999px')

    wrapper.unmount()
  })

  it('выключение на лету снимает слушатель, включение обратно — возвращает', async () => {
    const wrapper = mountHarness()
    const textarea = wrapper.get('[data-self]').element as HTMLTextAreaElement

    await wrapper.setProps({ binding: { enabled: false } })
    await nextTick()

    expect(textarea.style.overflowY).toBe('')

    stubScrollHeight(textarea, 120)
    textarea.dispatchEvent(new Event('input'))
    expect(textarea.style.height).not.toBe('120px')

    await wrapper.setProps({ binding: true })
    await nextTick()

    expect(textarea.style.overflowY).toBe('hidden')
    textarea.dispatchEvent(new Event('input'))
    expect(textarea.style.height).toBe('120px')

    wrapper.unmount()
  })

  it('выключенная с самого начала директива поле не трогает', () => {
    const wrapper = mountHarness({ binding: false })
    const textarea = wrapper.get('[data-self]').element as HTMLTextAreaElement

    expect(textarea.style.overflowY).toBe('')

    stubScrollHeight(textarea, 150)
    textarea.dispatchEvent(new Event('input'))
    expect(textarea.style.height).toBe('')

    wrapper.unmount()
  })

  it('на элементе без textarea не падает ни в одном хуке', async () => {
    const Empty = defineComponent({
      name: 'HarnessAutosizeEmpty',
      directives: { autosize: vAutosize },
      template: '<div v-autosize data-empty>без поля</div>',
    })

    const wrapper = mount(Empty, { attachTo: document.body })

    await nextTick()
    expect(() => wrapper.unmount()).not.toThrow()
  })
})
