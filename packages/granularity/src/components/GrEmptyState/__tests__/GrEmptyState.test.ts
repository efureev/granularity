import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { describe, expect, it, vi } from 'vitest'

vi.mock('~icons/lucide/inbox', () => {
  return {
    default: defineComponent({
      name: 'IconInbox',
      template: '<svg data-icon="inbox" />',
    }),
  }
})

import GrEmptyState from '../GrEmptyState.vue'

describe('GrEmptyState', () => {
  it('рендерит title, optional description и slot', () => {
    const wrapper = mount(GrEmptyState, {
      props: {
        title: 'No data',
        description: 'Try changing filters',
      },
      slots: {
        default: '<button>Reload</button>',
      },
    })

    expect(wrapper.text()).toContain('No data')
    expect(wrapper.text()).toContain('Try changing filters')
    expect(wrapper.html()).toContain('Reload')
    expect(wrapper.find('[data-icon="inbox"]').exists()).toBe(true)
  })

  it('не рендерит description-block без description', () => {
    const wrapper = mount(GrEmptyState, {
      props: {
        title: 'No data',
      },
    })

    expect(wrapper.text()).toContain('No data')
    expect(wrapper.text()).not.toContain('Try changing filters')
  })
})