import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'

import GrAutocomplete from '../GrAutocomplete.vue'
import { composingKeydown } from '../../../testing/keyboard'

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

  it('выбор опции эмитит и change — контракт форм-контрола', async () => {
    const wrapper = mount(GrAutocomplete, {
      props: { modelValue: '', options: OPTIONS, ariaLabel: 'Framework' },
    })
    await getInput(wrapper).trigger('focus')
    getTeleportedOptions()[1].click()
    await nextTick()

    expect(wrapper.emitted('change')?.[0]).toEqual(['react'])
  })

  it('clearable: очистка эмитит clear и change', async () => {
    const wrapper = mount(GrAutocomplete, {
      props: { modelValue: 'react', options: OPTIONS, ariaLabel: 'Framework', clearable: true },
    })

    await wrapper.get('[data-gr-autocomplete-clear]').trigger('click')

    expect(wrapper.emitted('clear')).toHaveLength(1)
    expect(wrapper.emitted('change')?.at(-1)).toEqual([''])
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

  it('чип — это бейдж выбранного тона: своя плашка была невидима на светлой теме', () => {
    const wrapper = mount(GrAutocomplete, {
      props: { modelValue: ['vue'], multiple: true, options: OPTIONS, ariaLabel: 'Stack' },
    })

    const chip = wrapper.get('[data-gr-autocomplete-chip]')

    // Soft-бейдж несёт сплошную подложку И рамку — именно рамка делает чип
    // различимым на фоне поля (`--gr-muted` против `--gr-bg` — 7 единиц из 255).
    expect(chip.classes()).toContain('bg-[var(--gr-muted)]')
    expect(chip.classes()).toContain('border-[var(--gr-brd)]')

    const toned = mount(GrAutocomplete, {
      props: { modelValue: ['vue'], multiple: true, options: OPTIONS, ariaLabel: 'Stack', tagTone: 'success' },
    })

    expect(toned.get('[data-gr-autocomplete-chip]').classes())
      .toContain('bg-[var(--gr-success-light)]')
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

describe('GrAutocomplete — IME-композиция', () => {
  it('Enter во время композиции не выбирает опцию', async () => {
    const wrapper = mount(GrAutocomplete, {
      props: { modelValue: '', options: OPTIONS, ariaLabel: 'Framework' },
    })
    const input = getInput(wrapper)
    await input.trigger('focus')

    composingKeydown(input.element, 'Enter')
    await nextTick()

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    wrapper.unmount()
  })
})

describe('GrAutocomplete — v-model:open', () => {
  it('`:open="true"` показывает панель без фокуса', async () => {
    const wrapper = mount(GrAutocomplete, {
      props: { modelValue: '', options: OPTIONS, ariaLabel: 'Framework', open: true },
    })
    await nextTick()

    expect(getInput(wrapper).attributes('aria-expanded')).toBe('true')
    expect(getTeleportedOptions().length).toBeGreaterThan(0)
    wrapper.unmount()
  })

  it('uncontrolled: открытие фокусом эмитит `update:open`', async () => {
    const wrapper = mount(GrAutocomplete, {
      props: { modelValue: '', options: OPTIONS, ariaLabel: 'Framework' },
    })

    await getInput(wrapper).trigger('focus')

    expect(getInput(wrapper).attributes('aria-expanded')).toBe('true')
    expect(wrapper.emitted('update:open')?.at(-1)).toEqual([true])
    wrapper.unmount()
  })

  it('в controlled-режиме состоянием владеет родитель', async () => {
    const wrapper = mount(GrAutocomplete, {
      props: { modelValue: '', options: OPTIONS, ariaLabel: 'Framework', open: false },
    })

    await getInput(wrapper).trigger('focus')

    expect(wrapper.emitted('update:open')?.at(-1)).toEqual([true])
    expect(getInput(wrapper).attributes('aria-expanded')).toBe('false')

    await wrapper.setProps({ open: true })
    expect(getInput(wrapper).attributes('aria-expanded')).toBe('true')
    wrapper.unmount()
  })
})

describe('GrAutocomplete — name (нативная форма)', () => {
  it('single: hidden input со значением модели, а не с текстом запроса', () => {
    const wrapper = mount(GrAutocomplete, {
      props: { modelValue: 'vue', options: OPTIONS, name: 'framework', ariaLabel: 'Framework' },
    })
    const hidden = wrapper.get('input[type="hidden"]')
    expect(hidden.attributes('name')).toBe('framework')
    expect((hidden.element as HTMLInputElement).value).toBe('vue')
    wrapper.unmount()
  })

  it('multiple: hidden input на каждое значение; без name — ни одного', () => {
    const withName = mount(GrAutocomplete, {
      props: { modelValue: ['vue', 'react'], multiple: true, options: OPTIONS, name: 'fw', ariaLabel: 'F' },
    })
    expect(withName.findAll('input[type="hidden"]').map(i => (i.element as HTMLInputElement).value))
      .toEqual(['vue', 'react'])
    withName.unmount()

    const without = mount(GrAutocomplete, {
      props: { modelValue: ['vue'], multiple: true, options: OPTIONS, ariaLabel: 'F' },
    })
    expect(without.find('input[type="hidden"]').exists()).toBe(false)
    without.unmount()
  })
})

describe('GrAutocomplete — очистка, minQueryLength и remote options', () => {
  it('кнопка очистки табируема (единая конвенция с GrSelect)', () => {
    const wrapper = mount(GrAutocomplete, {
      props: { modelValue: 'vue', options: OPTIONS, clearable: true, ariaLabel: 'F' },
    })

    expect(wrapper.get('[data-gr-autocomplete-clear]').attributes('tabindex')).toBeUndefined()
    wrapper.unmount()
  })

  it('ниже minQueryLength список пуст и виден hint, а не старые результаты', async () => {
    const wrapper = mount(GrAutocomplete, {
      props: { modelValue: '', options: OPTIONS, minQueryLength: 3, ariaLabel: 'F' },
    })
    const input = getInput(wrapper)
    await input.trigger('focus')
    await input.setValue('vu')
    await nextTick()

    expect(getTeleportedOptions()).toHaveLength(0)
    expect(document.body.querySelector('[data-gr-autocomplete-hint]')?.textContent).toContain('3')

    wrapper.unmount()
  })

  it('смена props.options в remote-режиме снова видна до следующего ответа', async () => {
    const wrapper = mount(GrAutocomplete, {
      props: {
        modelValue: '',
        options: [{ value: 'start', label: 'Start' }],
        fetchOptions: async () => [{ value: 'remote', label: 'Remote' }],
        debounce: 0,
        ariaLabel: 'F',
      },
    })
    const input = getInput(wrapper)

    await input.trigger('focus')
    await input.setValue('r')
    await new Promise(resolve => setTimeout(resolve, 5))
    await nextTick()
    expect(getTeleportedOptions().map(el => el.textContent?.trim())).toEqual(['Remote'])

    // Родитель обновил стартовый список — он снова источник до нового ответа.
    await wrapper.setProps({ options: [{ value: 'fresh', label: 'Fresh' }] })
    await nextTick()
    expect(getTeleportedOptions().map(el => el.textContent?.trim())).toEqual(['Fresh'])

    wrapper.unmount()
  })

  it('пересборка того же по составу `options` remote-результаты не трогает', async () => {
    const wrapper = mount(GrAutocomplete, {
      props: {
        modelValue: '',
        options: [{ value: 'start', label: 'Start' }],
        fetchOptions: async () => [{ value: 'remote', label: 'Remote' }],
        debounce: 0,
        ariaLabel: 'F',
      },
    })
    const input = getInput(wrapper)

    await input.trigger('focus')
    await input.setValue('r')
    await new Promise(resolve => setTimeout(resolve, 5))
    await nextTick()
    expect(getTeleportedOptions().map(el => el.textContent?.trim())).toEqual(['Remote'])

    // Инлайн-литерал `:options="[...]"` пересоздаётся на каждом ререндере
    // родителя — в том числе на том, который вызвал сам компонент своим
    // `update:modelValue`. Состав тот же, значит трогать нечего.
    await wrapper.setProps({ options: [{ value: 'start', label: 'Start' }] })
    await nextTick()
    expect(getTeleportedOptions().map(el => el.textContent?.trim())).toEqual(['Remote'])

    wrapper.unmount()
  })

  it('подсказка minQueryLength видна и при allowCustomValue', async () => {
    const wrapper = mount(GrAutocomplete, {
      props: { modelValue: '', options: OPTIONS, minQueryLength: 3, allowCustomValue: true, ariaLabel: 'F' },
    })
    const input = getInput(wrapper)
    await input.trigger('focus')
    await input.setValue('vu')
    await nextTick()

    // Строка «Add …» объясняет, что делать с набранным, но не то, куда делись
    // опции: подсказка нужна рядом с ней, а не вместо неё.
    expect(document.body.querySelector('[data-gr-autocomplete-add-option]')).toBeTruthy()
    expect(document.body.querySelector('[data-gr-autocomplete-hint]')?.textContent).toContain('3')

    wrapper.unmount()
  })
})
