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
    const wrapper = mountWithHotkey({ 'Escape': handler })

    dispatchKey(window, 'Escape')
    expect(handler).toHaveBeenCalledTimes(1)

    wrapper.unmount()
  })

  it('element scope: НЕ срабатывает на window, срабатывает на событиях элемента', () => {
    const handler = vi.fn()
    const wrapper = mountWithHotkey({ handlers: { 'Escape': handler }, scope: 'element' })

    dispatchKey(window, 'Escape')
    expect(handler).not.toHaveBeenCalled()

    const el = wrapper.get('[data-el]').element as HTMLElement
    dispatchKey(el, 'Escape')
    expect(handler).toHaveBeenCalledTimes(1)

    wrapper.unmount()
  })

  it('element scope: слушатель снимается при unmount', () => {
    const handler = vi.fn()
    const wrapper = mountWithHotkey({ handlers: { 'Escape': handler }, scope: 'element' })
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
    const wrapper = mountWithHotkey({ 'Escape': handler })

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', isComposing: true, bubbles: true }))
    expect(handler).not.toHaveBeenCalled()

    wrapper.unmount()
  })

  it('смена scope на лету переносит слушатель', async () => {
    const handler = vi.fn()
    const wrapper = mountWithHotkey({ handlers: { 'Escape': handler }, scope: 'global' })

    dispatchKey(window, 'Escape')
    expect(handler).toHaveBeenCalledTimes(1)

    await wrapper.setProps({ binding: { handlers: { 'Escape': handler }, scope: 'element' } })

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
