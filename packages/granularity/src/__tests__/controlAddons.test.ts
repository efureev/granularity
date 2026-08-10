import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import GrAutocomplete from '../components/GrAutocomplete/GrAutocomplete.vue'
import GrInputTag from '../components/GrInputTag/GrInputTag.vue'
import GrSelect from '../components/GrSelect/GrSelect.vue'
import GrTreeSelect from '../components/GrTreeSelect/GrTreeSelect.vue'

/**
 * Аддоны у контролов с текстовой оболочкой.
 *
 * `GrInput` и `GrNumberInput` проверяются в своих сюитах — там же живёт
 * геометрия паддингов со степперами. Здесь — четыре контрола, которые получили
 * `prefix`/`suffix` следом, и общая для всех часть контракта: слот рендерится,
 * ширина ограничивается пропами, `*Fixed` даёт жёсткий размер.
 */
const controls: {
  name: string
  component: unknown
  props: Record<string, unknown>
  prefix: string
  suffix: string
}[] = [
  {
    name: 'GrAutocomplete',
    component: GrAutocomplete,
    props: { modelValue: '', options: [] },
    prefix: '[data-gr-autocomplete-prefix]',
    suffix: '[data-gr-autocomplete-suffix]',
  },
  {
    name: 'GrTreeSelect',
    component: GrTreeSelect,
    props: { modelValue: null, data: [], nodeKey: 'id' },
    prefix: '[data-gr-tree-select-prefix]',
    suffix: '[data-gr-tree-select-suffix]',
  },
  {
    name: 'GrInputTag',
    component: GrInputTag,
    props: { modelValue: [] },
    prefix: '[data-gr-input-tag-prefix]',
    suffix: '[data-gr-input-tag-suffix]',
  },
  {
    name: 'GrSelect',
    component: GrSelect,
    props: { modelValue: '', options: [], optionsView: 'panel' },
    prefix: '[data-gr-select-prefix]',
    suffix: '[data-gr-select-suffix]',
  },
]

describe.each(controls)('аддоны $name', ({ component, props, prefix, suffix }) => {
  it('рендерит аддон только при наличии слота', () => {
    const without = mount(component as any, { props })
    expect(without.find(prefix).exists()).toBe(false)
    expect(without.find(suffix).exists()).toBe(false)

    const withAddons = mount(component as any, {
      props,
      slots: { prefix: '₽', suffix: 'kg' },
    })
    expect(withAddons.get(prefix).text()).toBe('₽')
    expect(withAddons.get(suffix).text()).toBe('kg')
  })

  it('ограничивает ширину аддона пропами min/max', () => {
    const wrapper = mount(component as any, {
      props: {
        ...props,
        prefixMinWidth: '1rem',
        prefixMaxWidth: '3rem',
        suffixMinWidth: '2rem',
        suffixMaxWidth: '4rem',
      },
      slots: { prefix: 'очень-длинный-префикс', suffix: 'очень-длинный-суффикс' },
    })

    const prefixEl = wrapper.get(prefix).element as HTMLElement
    expect(prefixEl.style.minWidth).toBe('1rem')
    expect(prefixEl.style.maxWidth).toBe('3rem')

    const suffixEl = wrapper.get(suffix).element as HTMLElement
    expect(suffixEl.style.minWidth).toBe('2rem')
    expect(suffixEl.style.maxWidth).toBe('4rem')
  })

  it('`*Fixed` даёт жёсткую ширину — колонка полей не плывёт', () => {
    const wrapper = mount(component as any, {
      props: {
        ...props,
        prefixFixed: true,
        prefixMaxWidth: '2.75rem',
        suffixFixed: true,
        suffixMinWidth: '1.5rem',
      },
      slots: { prefix: '₽', suffix: 'kg' },
    })

    const prefixEl = wrapper.get(prefix).element as HTMLElement
    expect(prefixEl.style.width).toBe('2.75rem')
    expect(prefixEl.style.minWidth).toBe('2.75rem')
    expect(prefixEl.style.maxWidth).toBe('2.75rem')

    // Без `*MaxWidth` жёсткая ширина берётся из `*MinWidth`.
    const suffixEl = wrapper.get(suffix).element as HTMLElement
    expect(suffixEl.style.width).toBe('1.5rem')
  })
})

describe('аддоны GrTreeSelect: место в поле', () => {
  const props = { modelValue: null, data: [], nodeKey: 'id' as const }

  it('префикс отодвигает текст триггера, суффикс — с учётом зоны шеврона', () => {
    const wrapper = mount(GrTreeSelect, {
      props: { ...props, size: 'md' as const },
      slots: { prefix: '₽', suffix: 'kg' },
    })

    const trigger = wrapper.get('[data-gr-tree-select-trigger]').element as HTMLInputElement

    expect(trigger.style.paddingLeft).toBe('calc(12px + 2.5rem)')
    // Ширина аддона + зона крестика/шеврона + базовый отступ ступени.
    expect(trigger.style.paddingRight).toBe('calc(12px + 4.75rem)')
  })

  it('без аддонов отступы задаёт класс, а не инлайн-стиль', () => {
    const wrapper = mount(GrTreeSelect, { props })
    const trigger = wrapper.get('[data-gr-tree-select-trigger]').element as HTMLInputElement

    expect(trigger.style.paddingLeft).toBe('')
    expect(trigger.style.paddingRight).toBe('')
  })
})

describe('аддоны GrSelect: только панельный режим', () => {
  it('в нативном режиме слоты не рендерятся', () => {
    const wrapper = mount(GrSelect, {
      props: { modelValue: '', options: [], optionsView: 'native' as const },
      slots: { prefix: '₽', suffix: 'kg' },
    })

    expect(wrapper.find('[data-gr-select-prefix]').exists()).toBe(false)
    expect(wrapper.find('[data-gr-select-suffix]').exists()).toBe(false)
  })
})
