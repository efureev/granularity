import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import GrFormField from '../GrFormField.vue'

describe('granularity/GrFormField (unit)', () => {
  it('показывает label и текст ошибки под контролом', () => {
    const wrapper = mount(GrFormField, {
      props: {
        label: 'Email',
        forId: 'email',
        error: 'Email обязателен.',
        labelClass: ['font-medium'],
      },
      slots: {
        default: '<input id="email" />',
      },
    })

    expect(wrapper.classes()).toContain('flex')
    expect(wrapper.classes()).toContain('flex-col')
    expect(wrapper.classes()).toContain('gap-2')

    const label = wrapper.get('label')
    expect(label.text()).toBe('Email')
    expect(label.attributes('for')).toBe('email')
    expect(label.attributes('class')).toContain('text-[var(--muted-fg)]')
    expect(label.attributes('class')).toContain('font-medium')

    const errorEl = wrapper
      .findAll('div')
      .find(element => element.text() === 'Email обязателен.')

    expect(errorEl).toBeTruthy()
    expect(errorEl!.attributes('class')).toContain('text-[var(--ds-danger)]')
    expect(wrapper.get('input').attributes('id')).toBe('email')
  })

  it('не рендерит label и ошибку, если пропсы не переданы', () => {
    const wrapper = mount(GrFormField, {
      slots: {
        default: '<input id="username" />',
      },
    })

    expect(wrapper.find('label').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('обязателен')
    expect(wrapper.get('input').attributes('id')).toBe('username')
  })
})