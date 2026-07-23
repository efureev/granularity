import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'

import GrAutocomplete from '../GrAutocomplete.vue'

const OPTIONS = [
  { value: 'vue', label: 'Vue' },
  { value: 'react', label: 'React' },
  { value: 'svelte', label: 'Svelte' },
]

function getInput(wrapper: ReturnType<typeof mount>) {
  return wrapper.get('input[role="combobox"]')
}

function getTeleportedOptions(): HTMLButtonElement[] {
  return [...document.body.querySelectorAll<HTMLButtonElement>('button[role="option"]')]
}

describe('GrAutocomplete', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    vi.restoreAllMocks()
  })

  it('рендерит текстовый combobox с ARIA-контрактом', () => {
    const wrapper = mount(GrAutocomplete, {
      props: { modelValue: '', options: OPTIONS, ariaLabel: 'Framework' },
    })
    const input = getInput(wrapper)
    expect(input.attributes('role')).toBe('combobox')
    expect(input.attributes('aria-expanded')).toBe('false')
    expect(input.attributes('aria-autocomplete')).toBe('list')
  })

  it('открывается по фокусу и фильтрует опции по вводу (локально)', async () => {
    const wrapper = mount(GrAutocomplete, {
      props: { modelValue: '', options: OPTIONS, ariaLabel: 'Framework' },
    })
    const input = getInput(wrapper)

    await input.trigger('focus')
    expect(getInput(wrapper).attributes('aria-expanded')).toBe('true')
    expect(getTeleportedOptions()).toHaveLength(3)

    await input.setValue('sv')
    await nextTick()
    const labels = getTeleportedOptions().map(el => el.textContent?.trim())
    expect(labels).toEqual(['Svelte'])
  })

  it('эмитит update:modelValue при выборе опции (single)', async () => {
    const wrapper = mount(GrAutocomplete, {
      props: { modelValue: '', options: OPTIONS, ariaLabel: 'Framework' },
    })
    await getInput(wrapper).trigger('focus')
    getTeleportedOptions()[1].click()
    await nextTick()
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['react'])
  })

  it('поддерживает клавиатурную навигацию (ArrowDown + Enter)', async () => {
    const wrapper = mount(GrAutocomplete, {
      props: { modelValue: '', options: OPTIONS, ariaLabel: 'Framework' },
    })
    const input = getInput(wrapper)
    await input.trigger('focus')
    await input.trigger('keydown', { key: 'ArrowDown' })
    await input.trigger('keydown', { key: 'Enter' })
    // initActiveIndex → 0 (Vue), ArrowDown → 1 (React).
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['react'])
  })

  it('multiple: выбор добавляет значение, Backspace на пустом запросе удаляет последний chip', async () => {
    const wrapper = mount(GrAutocomplete, {
      props: { modelValue: ['vue'], multiple: true, options: OPTIONS, ariaLabel: 'Stack' },
    })
    expect(wrapper.findAll('[data-gr-autocomplete-chip]')).toHaveLength(1)

    const input = getInput(wrapper)
    await input.trigger('keydown', { key: 'Backspace' })
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([[]])
  })

  it('allowCustomValue: Enter коммитит произвольное значение', async () => {
    const wrapper = mount(GrAutocomplete, {
      props: { modelValue: '', options: OPTIONS, allowCustomValue: true, ariaLabel: 'Framework' },
    })
    const input = getInput(wrapper)
    await input.trigger('focus')
    await input.setValue('qwik')
    await nextTick()
    await input.trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['qwik'])
  })

  it('эмитит дебаунснутое событие search для async-загрузки', async () => {
    vi.useFakeTimers()
    const wrapper = mount(GrAutocomplete, {
      props: { modelValue: '', options: [], filterable: false, debounce: 200, ariaLabel: 'People' },
    })
    const input = getInput(wrapper)
    await input.setValue('ad')
    expect(wrapper.emitted('search')).toBeFalsy()
    vi.advanceTimersByTime(200)
    expect(wrapper.emitted('search')?.[0]).toEqual(['ad'])
    vi.useRealTimers()
  })

  it('показывает состояние загрузки и пустой результат', async () => {
    const wrapper = mount(GrAutocomplete, {
      props: { modelValue: '', options: [], loading: true, ariaLabel: 'People' },
    })
    await getInput(wrapper).trigger('focus')
    // Панель телепортится в body; спиннер живёт в оболочке (в дереве компонента).
    expect(document.body.querySelector('[data-gr-autocomplete-loading]')).toBeTruthy()
    expect(wrapper.find('[data-gr-autocomplete-spinner]').exists()).toBe(true)

    await wrapper.setProps({ loading: false })
    await nextTick()
    expect(document.body.querySelector('[data-gr-autocomplete-empty]')).toBeTruthy()
  })
})
