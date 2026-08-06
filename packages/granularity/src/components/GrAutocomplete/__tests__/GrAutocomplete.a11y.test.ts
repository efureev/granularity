import { mount } from '@vue/test-utils'
import { defineComponent, nextTick } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'

import GrAutocomplete from '../GrAutocomplete.vue'
import GrFormField from '../../GrFormField/GrFormField.vue'

/**
 * Контракт combobox: фокус живёт на `<input>`, список объявляется корректно,
 * состояния — озвучиваются. Всё это проверяется по отрендеренному DOM, потому
 * что панель уезжает телепортом и `wrapper.find` её не видит.
 */

const OPTIONS = [
  { value: 'vue', label: 'Vue' },
  { value: 'react', label: 'React' },
  { value: 'svelte', label: 'Svelte', disabled: true },
]

afterEach(() => {
  document.body.innerHTML = ''
})

function options(): HTMLButtonElement[] {
  return [...document.querySelectorAll<HTMLButtonElement>('[data-gr-autocomplete-option]')]
}

describe('GrAutocomplete — доступность панели', () => {
  it('опции не табируемы: Tab из поля выходит из виджета, а не в панель', async () => {
    const wrapper = mount(GrAutocomplete, {
      props: { modelValue: '', options: OPTIONS, ariaLabel: 'Framework' },
      attachTo: document.body,
    })
    await wrapper.get('input').trigger('focus')

    expect(options()).toHaveLength(3)
    expect(options().every(el => el.getAttribute('tabindex') === '-1')).toBe(true)

    wrapper.unmount()
  })

  it('прямые потомки listbox — только опции', async () => {
    const wrapper = mount(GrAutocomplete, {
      props: { modelValue: '', options: [], allowCustomValue: true, ariaLabel: 'Framework' },
      attachTo: document.body,
    })
    await wrapper.get('input').trigger('focus')
    await wrapper.get('input').setValue('qwik')
    await nextTick()

    const listbox = document.querySelector('[role="listbox"]')!
    const roles = [...listbox.children].map(child => child.getAttribute('role'))

    // Пустой результат и кнопка «Add …» раньше лежали здесь же и делали список
    // невалидным (`aria-required-children`).
    expect(roles).toEqual(['option'])
    expect(listbox.querySelector('[data-gr-autocomplete-status]')).toBeNull()

    wrapper.unmount()
  })

  it('асинхронные состояния объявляются живым регионом', async () => {
    const wrapper = mount(GrAutocomplete, {
      props: { modelValue: '', options: [], loading: true, ariaLabel: 'People' },
      attachTo: document.body,
    })
    await wrapper.get('input').trigger('focus')

    const status = document.querySelector('[data-gr-autocomplete-status]')!
    expect(status.getAttribute('role')).toBe('status')
    expect(status.getAttribute('aria-live')).toBe('polite')
    expect(status.querySelector('[data-gr-autocomplete-loading]')).toBeTruthy()

    await wrapper.setProps({ loading: false })
    expect(document.querySelector('[data-gr-autocomplete-empty]')).toBeTruthy()

    wrapper.unmount()
  })

  it('подсказка minQueryLength живёт в том же регионе', async () => {
    const wrapper = mount(GrAutocomplete, {
      props: { modelValue: '', options: [], minQueryLength: 3, ariaLabel: 'People' },
      attachTo: document.body,
    })
    await wrapper.get('input').trigger('focus')

    const status = document.querySelector('[data-gr-autocomplete-status]')!
    expect(status.querySelector('[data-gr-autocomplete-hint]')).toBeTruthy()

    wrapper.unmount()
  })

  it('id опции не зависит от значения: пробел в значении не рвёт aria-activedescendant', async () => {
    const wrapper = mount(GrAutocomplete, {
      props: {
        modelValue: '',
        options: [{ value: 'new york', label: 'New York' }],
        ariaLabel: 'City',
      },
      attachTo: document.body,
    })
    const input = wrapper.get('input')
    await input.trigger('focus')
    await input.trigger('keydown', { key: 'ArrowDown' })
    await nextTick()

    const active = input.attributes('aria-activedescendant')!
    expect(active).not.toContain(' ')
    expect(document.getElementById(active)).toBe(options()[0])

    wrapper.unmount()
  })

  it('выбор мышью оставляет фокус на поле', async () => {
    const wrapper = mount(GrAutocomplete, {
      props: { modelValue: '', options: OPTIONS, ariaLabel: 'Framework' },
      attachTo: document.body,
    })
    const input = wrapper.get('input')
    input.element.focus()
    await input.trigger('focus')

    // Нативная кнопка забирает фокус на mousedown — если его не подавить, после
    // закрытия панели фокус уезжает на `<body>`.
    const event = new MouseEvent('mousedown', { bubbles: true, cancelable: true })
    options()[0].dispatchEvent(event)
    expect(event.defaultPrevented).toBe(true)

    options()[0].click()
    await nextTick()

    expect(document.activeElement).toBe(input.element)

    wrapper.unmount()
  })
})

describe('GrAutocomplete — disabled и readonly', () => {
  it('disabled из GrFormField гасит оболочку и убирает крестики чипов', async () => {
    const Harness = defineComponent({
      components: { GrAutocomplete, GrFormField },
      template: `
        <GrFormField label="Stack" disabled>
          <GrAutocomplete :model-value="['vue']" multiple :options="options" />
        </GrFormField>
      `,
      setup: () => ({ options: OPTIONS }),
    })

    const wrapper = mount(Harness, { attachTo: document.body })
    await nextTick()

    expect(wrapper.get('[data-gr-autocomplete-shell]').classes()).toContain('cursor-not-allowed')
    expect(wrapper.find('[data-gr-autocomplete-chip-remove]').exists()).toBe(false)

    wrapper.unmount()
  })

  it('readonly не даёт открыть панель и выбрать значение', async () => {
    const wrapper = mount(GrAutocomplete, {
      props: { modelValue: '', options: OPTIONS, readonly: true, clearable: true, ariaLabel: 'Framework' },
      attachTo: document.body,
    })
    const input = wrapper.get('input')

    await input.trigger('focus')
    expect(input.attributes('aria-expanded')).toBe('false')

    await input.trigger('keydown', { key: 'ArrowDown' })
    expect(input.attributes('aria-expanded')).toBe('false')
    expect(wrapper.find('[data-testid="gr-autocomplete-clear"]').exists()).toBe(false)

    wrapper.unmount()
  })
})
