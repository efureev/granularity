import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import GrSwitch from '../GrSwitch.vue'

describe('GrSwitch', () => {
  it('рендерит checked-state, label и вычисляет custom active color', () => {
    const wrapper = mount(GrSwitch, {
      props: {
        modelValue: true,
        ariaLabel: 'Notifications',
        activeBackgroundColor: ' #10b981 ',
      },
      slots: {
        default: 'Enabled',
      },
    })

    const button = wrapper.get('[role="switch"]')
    expect(button.attributes('aria-checked')).toBe('true')
    expect(button.attributes('aria-label')).toBe('Notifications')

    const track = wrapper.get('[data-testid="ds-switch-track"]')
    expect(track.attributes('class')).toContain('h-6')
    expect(track.attributes('class')).toContain('w-11')
    expect(track.attributes('style')).toContain('--ds-switch-track-bg: #10b981')
    expect(track.attributes('style')).toContain('--ds-switch-track-brd: #10b981')

    const thumb = wrapper.get('[data-testid="ds-switch-thumb"]')
    expect(thumb.attributes('class')).toContain('translate-x-5')
    expect(wrapper.text()).toContain('Enabled')
  })

  it('эмитит update:modelValue при клике, если компонент активен', async () => {
    const wrapper = mount(GrSwitch, {
      props: {
        modelValue: false,
      },
    })

    await wrapper.get('[role="switch"]').trigger('click')

    expect(wrapper.emitted('update:modelValue')).toEqual([[true]])
  })

  it('не эмитит update:modelValue в disabled-состоянии и учитывает size=lg', async () => {
    const wrapper = mount(GrSwitch, {
      props: {
        modelValue: true,
        disabled: true,
        size: 'lg',
        inactiveBackgroundColor: ' #94a3b8 ',
      },
      slots: {
        default: 'Disabled',
      },
    })

    await wrapper.get('[role="switch"]').trigger('click')

    const track = wrapper.get('[data-testid="ds-switch-track"]')
    expect(track.attributes('class')).toContain('h-7')
    expect(track.attributes('class')).toContain('w-14')

    const thumb = wrapper.get('[data-testid="ds-switch-thumb"]')
    expect(thumb.attributes('class')).toContain('h-6')
    expect(thumb.attributes('class')).toContain('w-6')
    expect(thumb.attributes('class')).toContain('translate-x-[28px]')

    const label = wrapper.get('span.text-base')
    expect(label.attributes('class')).toContain('text-base')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })
})