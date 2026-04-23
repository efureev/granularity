import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import DsFormSection from '../DsFormSection.vue'

describe('DsFormSection', () => {
  it('рендерит title, description и slot content', () => {
    const wrapper = mount(DsFormSection, {
      props: {
        title: 'Profile settings',
        description: 'Manage your public information',
      },
      slots: {
        default: '<input type="text" value="Alice" />',
      },
    })

    expect(wrapper.text()).toContain('Profile settings')
    expect(wrapper.text()).toContain('Manage your public information')
    expect(wrapper.get('input').element).toBeInstanceOf(HTMLInputElement)
  })

  it('не рендерит description-блок, если описание не передано', () => {
    const wrapper = mount(DsFormSection, {
      props: {
        title: 'Security',
      },
    })

    expect(wrapper.text()).toContain('Security')
    expect(wrapper.find('.text-\\[var\\(--muted-fg\\)\\]').exists()).toBe(false)
  })
})