import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'

import GrSelect from '../GrSelect.vue'

/**
 * Контракт панели-combobox: фокус живёт на триггере (или в поле поиска), список
 * состоит только из опций, состояния объявляются живым регионом. Всё через
 * `document`, потому что панель уезжает телепортом.
 */

const OPTIONS = [
  { value: 'vue', label: 'Vue' },
  { value: 'react', label: 'React' },
  { value: 'svelte', label: 'Svelte', disabled: true },
]

const GROUPED = [
  { label: 'Frontend', options: [{ value: 'vue', label: 'Vue' }, { value: 'react', label: 'React' }] },
  { label: 'Backend', options: [{ value: 'go', label: 'Go' }] },
]

afterEach(() => {
  document.body.innerHTML = ''
})

function mountPanel(props: Record<string, unknown> = {}) {
  return mount(GrSelect, {
    props: {
      modelValue: '',
      optionsView: 'panel',
      ariaLabel: 'Stack',
      options: OPTIONS,
      ...props,
    },
    attachTo: document.body,
  })
}

function options(): HTMLButtonElement[] {
  return [...document.querySelectorAll<HTMLButtonElement>('[data-gr-select-option]')]
}

describe('GrSelect — панель как listbox', () => {
  it('опции не табируемы: Tab уходит из виджета, а не в панель', async () => {
    const wrapper = mountPanel()
    await wrapper.get('[data-gr-select-trigger]').trigger('click')

    expect(options()).toHaveLength(3)
    expect(options().every(el => el.getAttribute('tabindex') === '-1')).toBe(true)

    wrapper.unmount()
  })

  it('прямые потомки listbox — только опции', async () => {
    const wrapper = mountPanel()
    await wrapper.get('[data-gr-select-trigger]').trigger('click')

    const listbox = document.querySelector('[data-gr-select-listbox]')!
    expect([...listbox.children].map(child => child.getAttribute('role'))).toEqual(['option', 'option', 'option'])

    wrapper.unmount()
  })

  it('группа объявлена группой и получает имя от своего заголовка', async () => {
    const wrapper = mountPanel({ options: GROUPED })
    await wrapper.get('[data-gr-select-trigger]').trigger('click')

    const listbox = document.querySelector('[data-gr-select-listbox]')!
    expect([...listbox.children].map(child => child.getAttribute('role'))).toEqual(['group', 'group'])

    const group = listbox.querySelector('[role="group"]')!
    const labelId = group.getAttribute('aria-labelledby')!
    expect(document.getElementById(labelId)?.textContent?.trim()).toBe('Frontend')
    expect(group.querySelectorAll('[role="option"]')).toHaveLength(2)

    wrapper.unmount()
  })

  it('пустой результат живёт вне списка и объявляется', async () => {
    const wrapper = mountPanel({ options: [] })
    await wrapper.get('[data-gr-select-trigger]').trigger('click')

    const empty = document.querySelector('[data-gr-select-empty]')!
    expect(empty.getAttribute('role')).toBe('status')
    expect(empty.getAttribute('aria-live')).toBe('polite')
    expect(document.querySelector('[data-gr-select-listbox] [data-gr-select-empty]')).toBeNull()

    wrapper.unmount()
  })

  it('загрузка объявляется живым регионом', async () => {
    const wrapper = mountPanel({ loading: true, options: [] })
    await wrapper.get('[data-gr-select-trigger]').trigger('click')

    const loading = document.querySelector('[data-gr-select-loading]')!
    expect(loading.getAttribute('role')).toBe('status')
    expect(loading.getAttribute('aria-live')).toBe('polite')

    wrapper.unmount()
  })

  it('слоты `#empty` и `#loading` подменяют состояния', async () => {
    const empty = mount(GrSelect, {
      props: { modelValue: '', optionsView: 'panel', ariaLabel: 'S', options: [] },
      slots: { empty: '<span data-custom-empty>Пусто</span>' },
      attachTo: document.body,
    })
    await empty.get('[data-gr-select-trigger]').trigger('click')
    expect(document.querySelector('[data-custom-empty]')).toBeTruthy()
    empty.unmount()
    document.body.innerHTML = ''

    const loading = mount(GrSelect, {
      props: { modelValue: '', optionsView: 'panel', ariaLabel: 'S', options: [], loading: true },
      slots: { loading: '<span data-custom-loading>Грузим</span>' },
      attachTo: document.body,
    })
    await loading.get('[data-gr-select-trigger]').trigger('click')
    expect(document.querySelector('[data-custom-loading]')).toBeTruthy()
    loading.unmount()
  })

  it('id опции не зависит от значения: пробел в значении не рвёт aria-activedescendant', async () => {
    const wrapper = mountPanel({ options: [{ value: 'new york', label: 'New York' }] })
    const trigger = wrapper.get('[data-gr-select-trigger]')

    await trigger.trigger('click')
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    await nextTick()

    const active = trigger.attributes('aria-activedescendant')!
    expect(active).not.toContain(' ')
    expect(document.getElementById(active)).toBe(options()[0])

    wrapper.unmount()
  })

  it('выбор мышью не уводит фокус с триггера', async () => {
    const wrapper = mountPanel()
    const trigger = wrapper.get<HTMLElement>('[data-gr-select-trigger]')
    trigger.element.focus()
    await trigger.trigger('click')

    // Нативная кнопка забрала бы фокус на mousedown — панель закрывается, и он
    // уезжает на `<body>`.
    const event = new MouseEvent('mousedown', { bubbles: true, cancelable: true })
    options()[0].dispatchEvent(event)
    expect(event.defaultPrevented).toBe(true)

    options()[0].click()
    await nextTick()

    expect(document.activeElement).toBe(trigger.element)

    wrapper.unmount()
  })

  it('выключенная опция гасится токеном, а не прозрачностью', async () => {
    const wrapper = mountPanel()
    await wrapper.get('[data-gr-select-trigger]').trigger('click')

    const disabled = options()[2]
    expect(disabled.className).toContain('text-[var(--gr-muted-fg)]')
    expect(disabled.className).not.toContain('opacity-50')

    wrapper.unmount()
  })
})

describe('GrSelect — v-model:open', () => {
  function isPanelVisible(): boolean {
    const panel = document.querySelector<HTMLElement>('[data-gr-select-panel]')
    return Boolean(panel) && panel!.style.display !== 'none'
  }

  it('`:open="true"` показывает панель без клика', async () => {
    const wrapper = mountPanel({ open: true })
    await nextTick()

    expect(isPanelVisible()).toBe(true)
    expect(wrapper.get('[data-gr-select-trigger]').attributes('aria-expanded')).toBe('true')

    wrapper.unmount()
  })

  it('uncontrolled: открытие кликом эмитит `update:open`', async () => {
    const wrapper = mountPanel()

    await wrapper.get('[data-gr-select-trigger]').trigger('click')

    expect(isPanelVisible()).toBe(true)
    expect(wrapper.emitted('update:open')?.at(-1)).toEqual([true])

    wrapper.unmount()
  })

  it('в controlled-режиме состоянием владеет родитель', async () => {
    const wrapper = mountPanel({ open: false })

    await wrapper.get('[data-gr-select-trigger]').trigger('click')

    // Событие ушло, но панель осталась закрытой: значение не менял никто.
    expect(wrapper.emitted('update:open')?.at(-1)).toEqual([true])
    expect(isPanelVisible()).toBe(false)

    await wrapper.setProps({ open: true })
    expect(isPanelVisible()).toBe(true)

    wrapper.unmount()
  })
})

describe('GrSelect — клавиатура при allowCustomValue', () => {
  function searchInput(): HTMLInputElement {
    return document.querySelector<HTMLInputElement>('input[data-gr-select-search]')!
  }

  function pressOnSearch(key: string): void {
    searchInput().dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }))
  }

  async function mountWithQuery() {
    const wrapper = mountPanel({ allowCustomValue: true })
    await wrapper.get('[data-gr-select-trigger]').trigger('click')
    await nextTick()

    searchInput().value = 'v'
    searchInput().dispatchEvent(new Event('input', { bubbles: true }))
    await nextTick()

    return wrapper
  }

  it('Enter выбирает подсвеченную стрелками опцию, а не добавляет запрос', async () => {
    const wrapper = await mountWithQuery()

    // Стрелка вниз уводит с «Add …» на первую отфильтрованную опцию (Vue).
    pressOnSearch('Home')
    await nextTick()
    pressOnSearch('ArrowDown')
    await nextTick()
    pressOnSearch('Enter')
    await nextTick()

    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toBe('vue')
    wrapper.unmount()
  })

  it('строка «Add …» — часть навигации: активна по Home, Enter добавляет значение', async () => {
    const wrapper = await mountWithQuery()

    pressOnSearch('Home')
    await nextTick()

    const addOption = document.querySelector<HTMLElement>('[data-gr-select-add-option]')!
    expect(addOption.id, 'у строки «Add …» есть id для aria-activedescendant').not.toBe('')
    expect(searchInput().getAttribute('aria-activedescendant')).toBe(addOption.id)

    pressOnSearch('Enter')
    await nextTick()

    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toBe('v')
    wrapper.unmount()
  })
})

describe('GrSelect — IME-композиция', () => {
  it('Enter во время композиции не выбирает опцию', async () => {
    const wrapper = mountPanel()
    await wrapper.get('[data-gr-select-trigger]').trigger('click')

    wrapper.get('[data-gr-select-trigger]').element.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', isComposing: true, bubbles: true, cancelable: true }),
    )
    await nextTick()

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    wrapper.unmount()
  })
})

describe('GrSelect — name (нативная форма)', () => {
  it('panel-режим: hidden input(ы) по значениям; пусто — ни одного', async () => {
    const wrapper = mountPanel({ name: 'stack', modelValue: 'vue' })
    const hidden = wrapper.get('input[type="hidden"]')
    expect(hidden.attributes('name')).toBe('stack')
    expect((hidden.element as HTMLInputElement).value).toBe('vue')

    await wrapper.setProps({ modelValue: ['vue', 'react'], multiple: true })
    expect(wrapper.findAll('input[type="hidden"]').map(i => (i.element as HTMLInputElement).value))
      .toEqual(['vue', 'react'])

    await wrapper.setProps({ modelValue: [], multiple: true })
    expect(wrapper.find('input[type="hidden"]').exists()).toBe(false)
    wrapper.unmount()
  })

  it('native-режим: `name` уходит на сам <select>', () => {
    const wrapper = mount(GrSelect, {
      props: { modelValue: 'vue', options: OPTIONS, name: 'stack', ariaLabel: 'Stack' },
    })
    expect(wrapper.get('select').attributes('name')).toBe('stack')
    wrapper.unmount()
  })
})
