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

import DsRadioGroup from '../DsRadioGroup.vue'

describe('DsRadioGroup', () => {
  it('рендерит options и эмитит update:modelValue для radiobox-варианта', async () => {
    const wrapper = mount(DsRadioGroup, {
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

  it('оборачивает button-вариант в DsButtonGroup', () => {
    const wrapper = mount(DsRadioGroup, {
      props: {
        modelValue: 'a',
        variant: 'button',
        options: [
          { value: 'a', label: 'Option A' },
          { value: 'b', label: 'Option B' },
        ],
      },
    })

    expect(wrapper.get('[data-ds-button-group]').exists()).toBe(true)
    expect(wrapper.findAll('[data-ds-button][role="radio"]').length).toBe(2)
  })
})