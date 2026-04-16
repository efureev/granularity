import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import DsRadio from '../DsRadio.vue'

describe('DsRadio (button)', () => {
  it('выглядит как DS-кнопка и отражает выбранное состояние через aria-checked', () => {
    const wrapper = mount(DsRadio, {
      props: {
        modelValue: 'a',
        value: 'a',
        size: 'lg',
        variant: 'button',
      },
      slots: {
        default: 'Option A',
      },
    })

    const btn = wrapper.get('[data-ds-radio]')
    expect(btn.attributes('data-ds-button')).toBeDefined()
    expect(btn.attributes('role')).toBe('radio')
    expect(btn.attributes('aria-checked')).toBe('true')

    const native = wrapper.get('input[type="radio"]').element as HTMLInputElement
    expect(native.checked).toBe(true)
    expect(btn.attributes('class')).toContain('inline-flex')
    expect(btn.attributes('class')).toContain('items-center')
    expect(btn.attributes('class')).toContain('rounded-md')
    expect(btn.attributes('class')).toContain('h-11')
    expect(btn.attributes('class')).toContain('bg-[var(--ds-button-primary-bg,var(--primary))]')
  })

  it('эмитит update:modelValue при клике (standalone v-model)', async () => {
    const wrapper = mount(DsRadio, {
      props: {
        modelValue: 'a',
        value: 'b',
        variant: 'button',
      },
      slots: {
        default: 'Option B',
      },
    })

    await wrapper.get('[data-ds-radio]').trigger('click')

    const events = wrapper.emitted('update:modelValue')
    expect(events).toBeTruthy()
    expect(events![0]).toEqual(['b'])
  })
})