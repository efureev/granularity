import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

// HeadlessUI внутри GrModal подменяем минимальными заглушками — палитру
// проверяем как список команд, а не как модалку (её контракт покрыт GrModal).
vi.mock('@headlessui/vue', async () => {
  const { defineComponent } = await import('vue')

  return {
    Dialog: defineComponent({
      name: 'Dialog',
      emits: ['close'],
      props: { as: { type: String, default: 'div' }, initialFocus: { type: Object, default: null } },
      template: '<div data-testid="hu-dialog"><slot /></div>',
    }),
    DialogPanel: defineComponent({ name: 'DialogPanel', template: '<div><slot /></div>' }),
    DialogTitle: defineComponent({ name: 'DialogTitle', template: '<div><slot /></div>' }),
    DialogDescription: defineComponent({ name: 'DialogDescription', template: '<div><slot /></div>' }),
    TransitionRoot: defineComponent({
      name: 'TransitionRoot',
      props: { show: { type: Boolean, default: false } },
      template: '<div v-if="show"><slot /></div>',
    }),
    TransitionChild: defineComponent({ name: 'TransitionChild', template: '<div><slot /></div>' }),
  }
})

import GrCommandPalette from '../GrCommandPalette.vue'
import type { GrCommandItem } from '../filtering'

const items: GrCommandItem[] = [
  { id: 'new', label: 'Новый документ', group: 'Файл', shortcut: ['⌘', 'N'] },
  { id: 'open', label: 'Открыть…', group: 'Файл' },
  { id: 'theme', label: 'Сменить тему', group: 'Настройки' },
  { id: 'archive', label: 'Архивировать', group: 'Настройки', disabled: true },
]

function mountPalette(props: Record<string, unknown> = {}) {
  return mount(GrCommandPalette, {
    props: { modelValue: true, items, ...props },
    global: { stubs: { teleport: true } },
  })
}

describe('GrCommandPalette', () => {
  it('рендерит combobox + listbox с группами и командами', () => {
    const wrapper = mountPalette()
    const input = wrapper.get('[data-testid="gr-command-palette-input"]')

    expect(input.attributes('role')).toBe('combobox')
    expect(input.attributes('aria-expanded')).toBe('true')
    expect(input.attributes('aria-controls')).toBe(wrapper.get('[data-testid="gr-command-palette-list"]').attributes('id'))
    expect(wrapper.get('[data-testid="gr-command-palette-list"]').attributes('role')).toBe('listbox')
    expect(wrapper.findAll('[data-gr-command-palette-group]').map(el => el.text()))
      .toEqual(['Файл', 'Настройки'])
    expect(wrapper.findAll('[data-gr-command-palette-item]')).toHaveLength(4)
  })

  it('активная команда указана через aria-activedescendant', async () => {
    const wrapper = mountPalette()
    const input = wrapper.get('[data-testid="gr-command-palette-input"]')
    const first = wrapper.get('[data-testid="gr-command-palette-item-new"]')

    expect(input.attributes('aria-activedescendant')).toBe(first.attributes('id'))
    expect(first.attributes('aria-selected')).toBe('true')

    await input.trigger('keydown', { key: 'ArrowDown' })
    expect(input.attributes('aria-activedescendant'))
      .toBe(wrapper.get('[data-testid="gr-command-palette-item-open"]').attributes('id'))
  })

  it('стрелки зациклены и пропускают disabled-команды', async () => {
    const wrapper = mountPalette()
    const input = wrapper.get('[data-testid="gr-command-palette-input"]')

    await input.trigger('keydown', { key: 'End' })
    // Последняя выбираемая — 'theme': 'archive' отключена.
    expect(input.attributes('aria-activedescendant'))
      .toBe(wrapper.get('[data-testid="gr-command-palette-item-theme"]').attributes('id'))

    await input.trigger('keydown', { key: 'ArrowDown' })
    expect(input.attributes('aria-activedescendant'))
      .toBe(wrapper.get('[data-testid="gr-command-palette-item-new"]').attributes('id'))

    await input.trigger('keydown', { key: 'ArrowUp' })
    expect(input.attributes('aria-activedescendant'))
      .toBe(wrapper.get('[data-testid="gr-command-palette-item-theme"]').attributes('id'))
  })

  it('Enter выбирает активную команду и закрывает палитру', async () => {
    const wrapper = mountPalette()
    const input = wrapper.get('[data-testid="gr-command-palette-input"]')

    await input.trigger('keydown', { key: 'ArrowDown' })
    await input.trigger('keydown', { key: 'Enter' })

    expect(wrapper.emitted('select')?.at(-1)?.[0]).toMatchObject({ id: 'open' })
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([false])
  })

  it('closeOnSelect=false оставляет палитру открытой', async () => {
    const wrapper = mountPalette({ closeOnSelect: false })
    await wrapper.get('[data-testid="gr-command-palette-item-theme"]').trigger('click')

    expect(wrapper.emitted('select')?.at(-1)?.[0]).toMatchObject({ id: 'theme' })
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('клик по disabled-команде ничего не выбирает', async () => {
    const wrapper = mountPalette()
    await wrapper.get('[data-testid="gr-command-palette-item-archive"]').trigger('click')

    expect(wrapper.emitted('select')).toBeUndefined()
  })

  it('ввод фильтрует список и эмитит search', async () => {
    const wrapper = mountPalette()
    const input = wrapper.get('[data-testid="gr-command-palette-input"]')

    await input.setValue('тему')

    expect(wrapper.emitted('search')?.at(-1)).toEqual(['тему'])
    expect(wrapper.findAll('[data-gr-command-palette-item]').map(el => el.attributes('data-testid')))
      .toEqual(['gr-command-palette-item-theme'])
  })

  it('filterable=false отдаёт фильтрацию наружу', async () => {
    const wrapper = mountPalette({ filterable: false })
    await wrapper.get('[data-testid="gr-command-palette-input"]').setValue('ничего такого')

    expect(wrapper.emitted('search')?.at(-1)).toEqual(['ничего такого'])
    expect(wrapper.findAll('[data-gr-command-palette-item]')).toHaveLength(4)
  })

  it('пустой результат показывает состояние «ничего не найдено»', async () => {
    const wrapper = mountPalette()
    await wrapper.get('[data-testid="gr-command-palette-input"]').setValue('zzz')

    expect(wrapper.get('[data-testid="gr-command-palette-empty"]').text()).toBe('Nothing found')
  })

  it('глобальное сочетание переключает открытие палитры', async () => {
    const wrapper = mountPalette({ modelValue: false })

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))

    // Платформа теста не важна: сработает ровно один из двух вариантов `mod`.
    expect(wrapper.emitted('update:modelValue')).toEqual([[true]])
  })

  it('снимает глобальный слушатель при размонтировании', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener')
    const wrapper = mountPalette({ modelValue: false })

    wrapper.unmount()

    expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
    removeSpy.mockRestore()
  })

  it('hotkey=null отключает глобальный слушатель', () => {
    const wrapper = mountPalette({ modelValue: false, hotkey: null })

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })
})
