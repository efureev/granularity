import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

import { vHotkey, type HotkeyBindingValue } from '../hotkey'

function mountWithHotkey(value: HotkeyBindingValue) {
  return mount(
    {
      props: ['binding'],
      template: '<div tabindex="0" v-hotkey="binding" data-el></div>',
    },
    {
      props: { binding: value },
      global: { directives: { hotkey: vHotkey } },
      attachTo: document.body,
    },
  )
}

function dispatchKey(target: Window | HTMLElement, key: string) {
  target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }))
}

function dispatchCombo(target: Window | HTMLElement, key: string, init: KeyboardEventInit) {
  target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, ...init }))
}

describe('vHotkey', () => {
  it('global scope (по умолчанию): срабатывает на события window', () => {
    const handler = vi.fn()
    const wrapper = mountWithHotkey({ Escape: handler })

    dispatchKey(window, 'Escape')
    expect(handler).toHaveBeenCalledTimes(1)

    wrapper.unmount()
  })

  it('element scope: НЕ срабатывает на window, срабатывает на событиях элемента', () => {
    const handler = vi.fn()
    const wrapper = mountWithHotkey({ handlers: { Escape: handler }, scope: 'element' })

    dispatchKey(window, 'Escape')
    expect(handler).not.toHaveBeenCalled()

    const el = wrapper.get('[data-el]').element as HTMLElement
    dispatchKey(el, 'Escape')
    expect(handler).toHaveBeenCalledTimes(1)

    wrapper.unmount()
  })

  it('element scope: слушатель снимается при unmount', () => {
    const handler = vi.fn()
    const wrapper = mountWithHotkey({ handlers: { Escape: handler }, scope: 'element' })
    const el = wrapper.get('[data-el]').element as HTMLElement

    wrapper.unmount()
    dispatchKey(el, 'Escape')
    expect(handler).not.toHaveBeenCalled()
  })

  it('комбо с модификатором срабатывает на нелатинской раскладке (по code)', () => {
    const handler = vi.fn()
    const wrapper = mountWithHotkey({ 'Ctrl+K': handler })

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'л', code: 'KeyK', ctrlKey: true, bubbles: true }))
    expect(handler).toHaveBeenCalledTimes(1)

    wrapper.unmount()
  })

  it('одиночная клавиша без модификаторов остаётся раскладко-зависимой', () => {
    const handler = vi.fn()
    const wrapper = mountWithHotkey({ k: handler })

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'л', code: 'KeyK', bubbles: true }))
    expect(handler).not.toHaveBeenCalled()

    wrapper.unmount()
  })

  it('хоткей на символ, набираемый через Shift, срабатывает', () => {
    const handler = vi.fn()
    const wrapper = mountWithHotkey({ '?': handler })

    window.dispatchEvent(new KeyboardEvent('keydown', { key: '?', shiftKey: true, bubbles: true }))
    expect(handler).toHaveBeenCalledTimes(1)

    wrapper.unmount()
  })

  it('событие во время IME-композиции игнорируется', () => {
    const handler = vi.fn()
    const wrapper = mountWithHotkey({ Escape: handler })

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', isComposing: true, bubbles: true }))
    expect(handler).not.toHaveBeenCalled()

    wrapper.unmount()
  })

  it('смена scope на лету переносит слушатель', async () => {
    const handler = vi.fn()
    const wrapper = mountWithHotkey({ handlers: { Escape: handler }, scope: 'global' })

    dispatchKey(window, 'Escape')
    expect(handler).toHaveBeenCalledTimes(1)

    await wrapper.setProps({ binding: { handlers: { Escape: handler }, scope: 'element' } })

    dispatchKey(window, 'Escape')
    expect(handler).toHaveBeenCalledTimes(1) // window больше не слушается

    const el = wrapper.get('[data-el]').element as HTMLElement
    dispatchKey(el, 'Escape')
    expect(handler).toHaveBeenCalledTimes(2)

    wrapper.unmount()
  })

  /**
   * Токен `mod` — тот же, которым пишется подсказка `GrKbd`. Без него привязку
   * приходилось дублировать двумя строками (`Meta+K` и `Ctrl+K`), и подсказка с
   * привязкой расходились молча.
   */
  describe('токен mod', () => {
    it('на macOS это Cmd, а Ctrl не срабатывает', () => {
      const platform = vi.spyOn(navigator, 'platform', 'get').mockReturnValue('MacIntel')
      const handler = vi.fn()
      const wrapper = mountWithHotkey({ 'mod+K': handler })

      dispatchCombo(window, 'k', { ctrlKey: true })
      expect(handler).not.toHaveBeenCalled()

      dispatchCombo(window, 'k', { metaKey: true })
      expect(handler).toHaveBeenCalledTimes(1)

      wrapper.unmount()
      platform.mockRestore()
    })

    it('вне macOS это Ctrl, а Cmd не срабатывает', () => {
      const platform = vi.spyOn(navigator, 'platform', 'get').mockReturnValue('Win32')
      const userAgent = vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('Mozilla/5.0 (Windows NT 10.0)')
      const handler = vi.fn()
      const wrapper = mountWithHotkey({ 'mod+K': handler })

      dispatchCombo(window, 'k', { metaKey: true })
      expect(handler).not.toHaveBeenCalled()

      dispatchCombo(window, 'k', { ctrlKey: true })
      expect(handler).toHaveBeenCalledTimes(1)

      wrapper.unmount()
      platform.mockRestore()
      userAgent.mockRestore()
    })
  })
})

/**
 * Последовательность «G, затем I»: шаги делятся пробелом, аккорд внутри шага —
 * плюсом. Раньше строка `'g i'` разбиралась как одна клавиша с невозможным
 * именем и не срабатывала вовсе.
 */
describe('v-hotkey: последовательности', () => {
  it('срабатывает после всех шагов, а не на первом', () => {
    const handler = vi.fn()
    const wrapper = mountWithHotkey({ 'g i': handler })

    dispatchKey(window, 'g')
    expect(handler, 'первый шаг ещё не цепочка').not.toHaveBeenCalled()

    dispatchKey(window, 'i')
    expect(handler).toHaveBeenCalledTimes(1)

    wrapper.unmount()
  })

  it('чужая клавиша между шагами сбрасывает набранное', () => {
    const handler = vi.fn()
    const wrapper = mountWithHotkey({ 'g i': handler })

    dispatchKey(window, 'g')
    dispatchKey(window, 'x')
    dispatchKey(window, 'i')

    expect(handler).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('обратный порядок не срабатывает', () => {
    const handler = vi.fn()
    const wrapper = mountWithHotkey({ 'g i': handler })

    dispatchKey(window, 'i')
    dispatchKey(window, 'g')

    expect(handler).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('цепочки с общим началом ведут каждая к своему', () => {
    const issues = vi.fn()
    const pulls = vi.fn()
    const wrapper = mountWithHotkey({ 'g i': issues, 'g p': pulls })

    dispatchKey(window, 'g')
    dispatchKey(window, 'p')

    expect(pulls).toHaveBeenCalledTimes(1)
    expect(issues).not.toHaveBeenCalled()

    wrapper.unmount()
  })

  /**
   * Сложившаяся цепочка снимается с буфера. Видно это на повторе одной клавиши:
   * без сброса третье нажатие достроило бы `g g` заново из хвоста предыдущей
   * цепочки — то есть один лишний `g` давал бы второе срабатывание.
   */
  it('сложившаяся цепочка снимается с буфера', () => {
    const handler = vi.fn()
    const wrapper = mountWithHotkey({ 'g g': handler })

    dispatchKey(window, 'g')
    dispatchKey(window, 'g')
    expect(handler).toHaveBeenCalledTimes(1)

    dispatchKey(window, 'g')
    expect(handler, 'третий `g` — половина следующей цепочки, а не конец прошлой').toHaveBeenCalledTimes(1)

    dispatchKey(window, 'g')
    expect(handler).toHaveBeenCalledTimes(2)

    wrapper.unmount()
  })

  it('шаг с модификатором сверяется целиком', () => {
    const handler = vi.fn()
    const wrapper = mountWithHotkey({ 'ctrl+k p': handler })

    dispatchKey(window, 'k')
    dispatchKey(window, 'p')
    expect(handler, 'без Ctrl первый шаг не тот').not.toHaveBeenCalled()

    dispatchCombo(window, 'k', { ctrlKey: true })
    dispatchKey(window, 'p')
    expect(handler).toHaveBeenCalledTimes(1)

    wrapper.unmount()
  })

  /**
   * Набирая текст, пользователь легко напечатает «g i», и увести его со
   * страницы посреди слова было бы худшим из возможных ответов.
   */
  it('в поле ввода цепочка без модификаторов не срабатывает', () => {
    const handler = vi.fn()
    const wrapper = mountWithHotkey({ 'g i': handler })

    const input = document.createElement('input')
    document.body.append(input)
    input.focus()

    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'g', bubbles: true }))
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'i', bubbles: true }))

    expect(handler).not.toHaveBeenCalled()

    input.remove()
    wrapper.unmount()
  })
})
