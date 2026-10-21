import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import GrRadio from '../GrRadio.vue'

describe('GrRadio (button)', () => {
  it('выглядит как GR-кнопка и отражает выбранное состояние через aria-checked', () => {
    const wrapper = mount(GrRadio, {
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

    const btn = wrapper.get('[data-gr-radio]')
    expect(btn.attributes('data-gr-button')).toBeDefined()
    expect(btn.attributes('role')).toBe('radio')
    expect(btn.attributes('aria-checked')).toBe('true')

    expect(btn.attributes('class')).toContain('inline-flex')
    expect(btn.attributes('class')).toContain('items-center')
    expect(btn.attributes('class')).toContain('rounded-ss-[var(--gr-button-radius-ss,var(--gr-button-corner-radius))]')
    expect(btn.attributes('class')).toContain('[--gr-button-step-radius:var(--gr-button-radius-lg)]')
    expect(btn.attributes('class')).toContain('h-11')
    expect(btn.attributes('class')).toContain('bg-[var(--gr-button-primary-bg)]')
  })

  // Слой отклика кнопки выбирает цвет по весу: выбранная solid-радио под
  // указателем откликается как solid, а не как прозрачный вес.
  it('называет вес, которым нарисована: выбранная — selectedButtonVariant', () => {
    const props = { value: 'a', variant: 'button' as const, buttonVariant: 'outline' as const, selectedButtonVariant: 'primary' as const }

    expect(mount(GrRadio, { props: { ...props, modelValue: 'a' }, slots: { default: 'A' } }).get('[data-gr-radio]').attributes('data-gr-variant')).toBe('primary')
    expect(mount(GrRadio, { props: { ...props, modelValue: 'b' }, slots: { default: 'A' } }).get('[data-gr-radio]').attributes('data-gr-variant')).toBe('outline')
  })

  // См. GrRadiobox.test.ts: в button-режиме тот же контракт — никакого вложенного
  // native input внутри `role="radio"`, значение формы уходит скрытым input'ом.
  it('в button-режиме тоже не вкладывает интерактивный контрол внутрь radio', () => {
    const wrapper = mount(GrRadio, {
      props: {
        modelValue: 'a',
        value: 'a',
        variant: 'button',
        name: 'plan',
      },
      slots: {
        default: 'Option A',
      },
    })

    expect(wrapper.find('input[type="radio"]').exists()).toBe(false)
    expect(wrapper.get('input[type="hidden"]').attributes('name')).toBe('plan')
  })

  it('эмитит update:modelValue при клике (standalone v-model)', async () => {
    const wrapper = mount(GrRadio, {
      props: {
        modelValue: 'a',
        value: 'b',
        variant: 'button',
      },
      slots: {
        default: 'Option B',
      },
    })

    await wrapper.get('[data-gr-radio]').trigger('click')

    const events = wrapper.emitted('update:modelValue')
    expect(events).toBeTruthy()
    expect(events![0]).toEqual(['b'])
  })
})
