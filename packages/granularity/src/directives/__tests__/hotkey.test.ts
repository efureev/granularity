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
})
