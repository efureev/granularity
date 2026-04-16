import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { describe, expect, it, vi } from 'vitest'

vi.mock('~icons/lucide/x', () => {
  return {
    default: defineComponent({
      name: 'IconClose',
      template: '<svg data-icon="x" />',
    }),
  }
})

import DsInputTag from '../DsInputTag.vue'

describe('DsInputTag', () => {
  it('добавляет тег по Enter', async () => {
    const wrapper = mount(DsInputTag, {
      props: {
        modelValue: [],
      },
    })

    const input = wrapper.get('[data-testid="ds-input-tag-input"]')
    await input.setValue('hello')
    await input.trigger('keydown', { key: 'Enter' })

    expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toEqual(['hello'])
    expect(wrapper.emitted('add')?.[0]?.[0]).toBe('hello')
  })

  it('по умолчанию игнорирует дубликаты', async () => {
    const wrapper = mount(DsInputTag, {
      props: {
        modelValue: [],
      },
    })

    const input = wrapper.get('[data-testid="ds-input-tag-input"]')
    await input.setValue('a')
    await input.trigger('keydown', { key: 'Enter' })

    const first = wrapper.emitted('update:modelValue')?.[0]?.[0] as string[]
    await wrapper.setProps({ modelValue: first })

    await input.setValue('a')
    await input.trigger('keydown', { key: 'Enter' })

    expect(wrapper.emitted('update:modelValue')?.length).toBe(1)
  })

  it('удаляет последний тег по Backspace при пустом input', async () => {
    const wrapper = mount(DsInputTag, {
      props: {
        modelValue: ['a', 'b'],
      },
    })

    const input = wrapper.get('[data-testid="ds-input-tag-input"]')
    await input.trigger('keydown', { key: 'Backspace' })

    expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toEqual(['a'])
    expect(wrapper.emitted('remove')?.[0]?.[0]).toBe('b')
  })

  it('удаляет тег по клику на крестик', async () => {
    const wrapper = mount(DsInputTag, {
      props: {
        modelValue: ['a', 'b'],
      },
    })

    const btn = wrapper.get('[data-testid="ds-input-tag-remove"][data-index="0"]')
    await btn.trigger('click')

    expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toEqual(['b'])
    expect(wrapper.emitted('remove')?.[0]).toEqual(['a', 0])
  })

  it('не добавляет теги, если достигнут max', async () => {
    const wrapper = mount(DsInputTag, {
      props: {
        modelValue: ['a', 'b'],
        max: 2,
      },
    })

    const input = wrapper.get('[data-testid="ds-input-tag-input"]')
    await input.setValue('c')
    await input.trigger('keydown', { key: 'Enter' })

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('не редактируется в disabled состоянии', async () => {
    const wrapper = mount(DsInputTag, {
      props: {
        modelValue: ['a'],
        disabled: true,
      },
    })

    const input = wrapper.get('[data-testid="ds-input-tag-input"]')
    await input.setValue('b')
    await input.trigger('keydown', { key: 'Enter' })

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.find('[data-testid="ds-input-tag-remove"]').exists()).toBe(false)
  })
})