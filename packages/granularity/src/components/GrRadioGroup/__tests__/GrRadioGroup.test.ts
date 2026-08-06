import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { describe, expect, it, vi } from 'vitest'

vi.mock('~icons/lucide/loader-circle', () => {
  return {
    default: defineComponent({
      name: 'IconLoader',
      template: '<svg data-icon="loader" />',
    }),
  }
})

import GrFormField from '../../GrFormField/GrFormField.vue'
import GrRadio from '../../GrRadio/GrRadio.vue'
import GrRadioGroup from '../GrRadioGroup.vue'

describe('GrRadioGroup', () => {
  it('рендерит options и эмитит update:modelValue для radiobox-варианта', async () => {
    const wrapper = mount(GrRadioGroup, {
      props: {
        modelValue: 'a',
        options: [
          { value: 'a', label: 'Option A' },
          { value: 'b', label: 'Option B' },
        ],
      },
    })

    const radios = wrapper.findAll('[role="radio"]')
    expect(radios).toHaveLength(2)
    expect(radios[0].attributes('aria-checked')).toBe('true')

    await radios[1].trigger('click')

    expect(wrapper.emitted('update:modelValue')).toEqual([['b']])
  })

  it('оборачивает button-вариант в GrButtonGroup', () => {
    const wrapper = mount(GrRadioGroup, {
      props: {
        modelValue: 'a',
        variant: 'button',
        options: [
          { value: 'a', label: 'Option A' },
          { value: 'b', label: 'Option B' },
        ],
      },
    })

    expect(wrapper.find('[data-gr-button-group]').exists()).toBe(true)
    expect(wrapper.findAll('[data-gr-button][role="radio"]').length).toBe(2)
  })
})

const options = [
  { value: 'a', label: 'Option A' },
  { value: 'b', label: 'Option B', description: 'Второй вариант' },
  { value: 'c', label: 'Option C', disabled: true },
]

describe('GrRadioGroup — опции', () => {
  // Раньше отключить одну опцию можно было только через слот.
  it('опция умеет быть отключённой и с описанием', () => {
    const wrapper = mount(GrRadioGroup, { props: { modelValue: 'a', options } })
    const radios = wrapper.findAll('[data-gr-radio]')

    expect(radios[2].attributes('aria-disabled')).toBe('true')
    expect(radios[2].attributes('tabindex')).toBe('-1')
    expect(wrapper.get('[data-gr-radio-description]').text()).toBe('Второй вариант')
  })

  it('отключённая опция работает и в кнопочном варианте', () => {
    const wrapper = mount(GrRadioGroup, { props: { modelValue: 'a', variant: 'button', options } })

    expect(wrapper.findAll('[data-gr-radio]')[2].attributes('aria-disabled')).toBe('true')
  })

  it('отключённая опция пропускается стрелками', async () => {
    const wrapper = mount(GrRadioGroup, { props: { modelValue: 'b', options } })

    await wrapper.findAll('[data-gr-radio]')[1].trigger('keydown', { key: 'ArrowDown' })

    // За `b` идёт отключённый `c`, поэтому выбор уходит по кругу на `a`.
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['a'])
  })
})

describe('GrRadioGroup — раскладка', () => {
  it('по умолчанию вертикальная, horizontal переводит в ряд', () => {
    const vertical = mount(GrRadioGroup, { props: { modelValue: 'a', options } })
    expect(vertical.get('[data-gr-radio-group] > div').classes()).toContain('grid')

    const horizontal = mount(GrRadioGroup, { props: { modelValue: 'a', options, orientation: 'horizontal' } })
    expect(horizontal.get('[data-gr-radio-group] > div').classes()).toContain('flex')
  })
})

describe('GrRadioGroup — состояния', () => {
  it('readonly не меняет выбор и не обещает клик курсором', async () => {
    const wrapper = mount(GrRadioGroup, { props: { modelValue: 'a', options, readonly: true } })
    const radios = wrapper.findAll('[data-gr-radio]')

    await radios[1].trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()

    expect(wrapper.get('[data-gr-radio-group]').attributes('aria-readonly')).toBe('true')
    expect(radios[0].classes()).toContain('cursor-default')
  })

  it('внутри GrFormField берёт имя, описание и состояние ошибки', () => {
    const Harness = defineComponent({
      components: { GrFormField, GrRadioGroup },
      data: () => ({ value: 'a', options }),
      template: `
        <GrFormField label="Статус" hint="Виден в списке" error="Выберите статус" required>
          <GrRadioGroup v-model="value" :options="options" />
        </GrFormField>
      `,
    })

    const wrapper = mount(Harness)
    const group = wrapper.get('[data-gr-radio-group]')

    expect(group.attributes('aria-labelledby')).toBeTruthy()
    expect(group.attributes('aria-describedby')).toBeTruthy()
    expect(group.attributes('aria-invalid')).toBe('true')
    expect(group.attributes('aria-required')).toBe('true')
    // Ошибка поля доходит и до вида переключателей.
    expect(wrapper.findAll('[data-gr-radio]')[0].attributes('aria-invalid')).toBe('true')
  })

  it('слотовый режим получает те же раскладку и контекст', () => {
    const Harness = defineComponent({
      components: { GrRadioGroup, GrRadio },
      data: () => ({ value: 'a' }),
      template: `
        <GrRadioGroup v-model="value" orientation="horizontal" disabled>
          <GrRadio value="a">A</GrRadio>
          <GrRadio value="b">B</GrRadio>
        </GrRadioGroup>
      `,
    })

    const wrapper = mount(Harness)

    expect(wrapper.get('[data-gr-radio-group] > div').classes()).toContain('flex')
    expect(wrapper.findAll('[data-gr-radio]')[1].attributes('aria-disabled')).toBe('true')
  })
})
