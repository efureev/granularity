import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { describe, expect, it, vi } from 'vitest'

vi.mock('~icons/lucide/info', () => {
  return {
    default: defineComponent({
      name: 'IconInfo',
      template: '<svg data-icon="info" />',
    }),
  }
})

import DsTooltip from '../DsTooltip.vue'

describe('DsTooltip', () => {
  it('рендерит текст tooltip и дефолтную иконку-триггер', () => {
    const wrapper = mount(DsTooltip, {
      props: {
        text: 'Helpful hint',
      },
    })

    const trigger = wrapper.get('[data-testid="ds-tooltip-trigger"]')
    expect(trigger.attributes('style')).toContain('--ds-tooltip-icon-color: var(--muted-fg)')
    expect(wrapper.get('[data-icon="info"]')).toBeTruthy()

    const tooltip = wrapper.get('[role="tooltip"]')
    expect(tooltip.text()).toContain('Helpful hint')
    expect(tooltip.attributes('class')).toContain('group-hover:opacity-100')
    expect(tooltip.attributes('class')).toContain('group-focus-within:opacity-100')
  })

  it('поддерживает кастомный слот и iconColor', () => {
    const wrapper = mount(DsTooltip, {
      props: {
        text: 'Custom trigger',
        iconColor: '#0f172a',
      },
      slots: {
        default: '<button type="button" data-testid="custom-trigger">?</button>',
      },
    })

    const trigger = wrapper.get('[data-testid="ds-tooltip-trigger"]')
    expect(trigger.attributes('style')).toContain('--ds-tooltip-icon-color: #0f172a')
    expect(wrapper.get('[data-testid="custom-trigger"]').text()).toBe('?')
    expect(wrapper.find('[data-icon="info"]').exists()).toBe(false)
  })
})