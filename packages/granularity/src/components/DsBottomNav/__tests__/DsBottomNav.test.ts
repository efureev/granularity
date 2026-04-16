import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import DsBottomNav from '../DsBottomNav.vue'

describe('DsBottomNav', () => {
  it('рендерит элементы и подсвечивает активный', () => {
    const wrapper = mount(DsBottomNav, {
      props: {
        modelValue: 'home',
        items: [
          { value: 'home', label: 'Home' },
          { value: 'profile', label: 'Profile' },
        ],
      },
    })

    const buttons = wrapper.findAll('button')

    expect(buttons).toHaveLength(2)
    expect(buttons[0].classes()).toContain('text-[var(--primary)]')
    expect(buttons[1].classes()).toContain('text-[var(--muted-fg)]')
  })

  it('эмитит update:modelValue по клику', async () => {
    const wrapper = mount(DsBottomNav, {
      props: {
        modelValue: 'home',
        items: [
          { value: 'home', label: 'Home' },
          { value: 'profile', label: 'Profile' },
        ],
      },
    })

    await wrapper.findAll('button')[1].trigger('click')

    expect(wrapper.emitted('update:modelValue')).toEqual([['profile']])
  })
})