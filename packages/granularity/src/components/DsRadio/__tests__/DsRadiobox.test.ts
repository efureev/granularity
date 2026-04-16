import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import DsRadio from '../DsRadio.vue'
import { dsRadioSafelist } from '../safelist'

describe('DsRadio (radiobox)', () => {
  it('держит в safelist базовые классы точки, чтобы dot не пропадал в собранных стилях', () => {
    expect(dsRadioSafelist).toContain('h-[6px]')
    expect(dsRadioSafelist).toContain('w-[6px]')
    expect(dsRadioSafelist).toContain('rounded-full')
    expect(dsRadioSafelist).toContain('transition-[transform,opacity,background-color]')
  })

  it('использует primary-цвет для кружочка (dot)', () => {
    const wrapper = mount(DsRadio, {
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

    const native = wrapper.get('input[type="radio"]').element as HTMLInputElement
    expect(native.checked).toBe(true)

    const dot = wrapper.get('[data-ds-radio-dot]')
    expect(dot.attributes('class')).toContain('bg-[var(--primary)]')
  })

  it('скрывает dot когда не выбрано', () => {
    const wrapper = mount(DsRadio, {
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

    const native = wrapper.get('input[type="radio"]').element as HTMLInputElement
    expect(native.checked).toBe(false)

    const dot = wrapper.get('[data-ds-radio-dot]')
    expect(dot.attributes('class')).toContain('opacity-0')
  })

  it('эмитит update:modelValue при выборе', async () => {
    const wrapper = mount(DsRadio, {
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