import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import GrSidebar from '..'

describe('GrSidebar', () => {
  it('рендерит title, subtitle и содержимое слота', () => {
    const wrapper = mount(GrSidebar, {
      props: {
        title: 'Workspace',
        subtitle: 'Administration',
      },
      slots: {
        default: '<nav><a href="#">Overview</a></nav>',
      },
    })

    expect(wrapper.text()).toContain('Workspace')
    expect(wrapper.text()).toContain('Administration')
    expect(wrapper.text()).toContain('Overview')
    expect(wrapper.find('aside').classes()).toContain('border-r')
  })

  it('не рендерит subtitle-блок, если subtitle не передан', () => {
    const wrapper = mount(GrSidebar, {
      props: {
        title: 'Workspace',
      },
    })

    expect(wrapper.text()).toContain('Workspace')
    expect(wrapper.find('.text-\\[var\\(--muted-fg\\)\\]').exists()).toBe(false)
  })
})