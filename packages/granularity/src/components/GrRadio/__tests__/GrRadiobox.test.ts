import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import GrRadio from '../GrRadio.vue'
import { grRadioSafelist } from '../safelist'

describe('GrRadio (radiobox)', () => {
  it('держит в safelist базовые классы точки, чтобы dot не пропадал в собранных стилях', () => {
    expect(grRadioSafelist).toContain('h-[6px]')
    expect(grRadioSafelist).toContain('w-[6px]')
    expect(grRadioSafelist).toContain('rounded-full')
    expect(grRadioSafelist).toContain('transition-[transform,opacity,background-color]')
  })

  it('использует primary-цвет для кружочка (dot)', () => {
    const wrapper = mount(GrRadio, {
      props: {
        modelValue: 'a',
        value: 'a',
      },
      slots: {
        default: 'Option A',
      },
    })

    const root = wrapper.get('[role="radio"]')
    expect(root.attributes('aria-checked')).toBe('true')

    const dot = wrapper.get('[data-gr-radio-dot]')
    expect(dot.attributes('class')).toContain('bg-[var(--gr-primary)]')
  })

  it('скрывает dot когда не выбрано', () => {
    const wrapper = mount(GrRadio, {
      props: {
        modelValue: 'a',
        value: 'b',
      },
      slots: {
        default: 'Option B',
      },
    })

    const root = wrapper.get('[role="radio"]')
    expect(root.attributes('aria-checked')).toBe('false')

    const dot = wrapper.get('[data-gr-radio-dot]')
    expect(dot.attributes('class')).toContain('opacity-0')
  })

  // Внутрь `role="radio"` нельзя вкладывать интерактивные элементы: роль объявляет
  // потомков презентационными, скринридер теряет виджет, axe падает на
  // `nested-interactive`. Значение в нативную форму уходит скрытым input'ом.
  it('не держит внутри себя интерактивных потомков', () => {
    const wrapper = mount(GrRadio, {
      props: { modelValue: 'a', value: 'a', name: 'plan' },
      slots: { default: 'Option A' },
    })

    expect(wrapper.find('input[type="radio"]').exists()).toBe(false)
    expect(wrapper.get('[role="radio"]').findAll('button, a, select, textarea, [tabindex]')).toHaveLength(0)
  })

  it('отправляет значение нативной формой только когда выбран, не disabled и есть name', () => {
    const checkedWrapper = mount(GrRadio, {
      props: { modelValue: 'a', value: 'a', name: 'plan' },
      slots: { default: 'Option A' },
    })

    const hidden = checkedWrapper.get('input[type="hidden"]')
    expect(hidden.attributes('name')).toBe('plan')
    expect(hidden.attributes('value')).toBe('a')

    const uncheckedWrapper = mount(GrRadio, {
      props: { modelValue: 'a', value: 'b', name: 'plan' },
      slots: { default: 'Option B' },
    })
    expect(uncheckedWrapper.find('input[type="hidden"]').exists()).toBe(false)

    const disabledWrapper = mount(GrRadio, {
      props: { modelValue: 'a', value: 'a', name: 'plan', disabled: true },
      slots: { default: 'Option A' },
    })
    expect(disabledWrapper.find('input[type="hidden"]').exists()).toBe(false)

    const namelessWrapper = mount(GrRadio, {
      props: { modelValue: 'a', value: 'a' },
      slots: { default: 'Option A' },
    })
    expect(namelessWrapper.find('input[type="hidden"]').exists()).toBe(false)
  })

  it('переносит id и required на сам radio-элемент', () => {
    const wrapper = mount(GrRadio, {
      props: { modelValue: 'a', value: 'a', id: 'plan-a', required: true },
      slots: { default: 'Option A' },
    })

    const root = wrapper.get('[role="radio"]')
    expect(root.attributes('id')).toBe('plan-a')
    expect(root.attributes('aria-required')).toBe('true')
  })

  it('эмитит update:modelValue при выборе', async () => {
    const wrapper = mount(GrRadio, {
      props: {
        modelValue: 'a',
        value: 'b',
      },
      slots: {
        default: 'Option B',
      },
    })

    await wrapper.get('[role="radio"]').trigger('click')

    const events = wrapper.emitted('update:modelValue')
    expect(events).toBeTruthy()
    expect(events![0]).toEqual(['b'])
  })
})