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

vi.mock('~icons/lucide/check-circle', () => {
  return {
    default: defineComponent({
      name: 'IconCheck',
      template: '<svg data-icon="check-circle" />',
    }),
  }
})

vi.mock('~icons/lucide/alert-triangle', () => {
  return {
    default: defineComponent({
      name: 'IconWarning',
      template: '<svg data-icon="alert-triangle" />',
    }),
  }
})

vi.mock('~icons/lucide/x-circle', () => {
  return {
    default: defineComponent({
      name: 'IconError',
      template: '<svg data-icon="x-circle" />',
    }),
  }
})

vi.mock('~icons/lucide/x', () => {
  return {
    default: defineComponent({
      name: 'IconClose',
      template: '<svg data-icon="x" />',
    }),
  }
})

import GrAlert from '../GrAlert.vue'

describe('GrAlert', () => {
  it('не рендерит кнопку закрытия по умолчанию', () => {
    const wrapper = mount(GrAlert, {
      props: {
        title: 'Title',
        tone: 'info',
      },
      slots: {
        default: 'Body',
      },
    })

    expect(wrapper.find('button[aria-label="Close"]').exists()).toBe(false)
  })

  it('рендерит кнопку закрытия и эмитит close при клике', async () => {
    const wrapper = mount(GrAlert, {
      props: {
        closable: true,
      },
      slots: {
        default: 'Body',
      },
    })

    const btn = wrapper.get('button[aria-label="Close"]')
    await btn.trigger('click')

    expect(wrapper.emitted('close')).toBeTruthy()
    expect(wrapper.emitted('close')?.length).toBe(1)
  })

  it('применяет amber-цвета для tone warning с variant light', () => {
    const wrapper = mount(GrAlert, {
      props: {
        tone: 'warning',
        variant: 'light',
        title: 'Warning light',
        closable: true,
      },
      slots: {
        default: 'Body',
      },
    })

    const alert = wrapper.get('[role="alert"]').element as HTMLDivElement

    expect(alert.style.getPropertyValue('--ds-alert-bg')).toBe('#fffbeb')
    expect(alert.style.getPropertyValue('--ds-alert-brd')).toBe('#fcd34d')
    expect(alert.style.getPropertyValue('--ds-alert-icon-color')).toBe('#92400e')
    expect(alert.style.getPropertyValue('--ds-alert-title-color')).toBe('#92400e')
    expect(alert.style.getPropertyValue('--ds-alert-text-color')).toBe('#92400e')
    expect(alert.style.getPropertyValue('--ds-alert-close-color')).toBe('#92400e')
  })

  it('позволяет переопределить цвета через пропсы', () => {
    const wrapper = mount(GrAlert, {
      props: {
        tone: 'success',
        title: 'Custom colors',
        closable: true,
        backgroundColor: '#111827',
        textColor: '#f9fafb',
        borderColor: '#22c55e',
      },
      slots: {
        default: 'Body',
      },
    })

    const alert = wrapper.get('[role="alert"]').element as HTMLDivElement

    expect(alert.style.getPropertyValue('--ds-alert-bg')).toBe('#111827')
    expect(alert.style.getPropertyValue('--ds-alert-brd')).toBe('#22c55e')
    expect(alert.style.getPropertyValue('--ds-alert-icon-color')).toBe('#f9fafb')
    expect(alert.style.getPropertyValue('--ds-alert-title-color')).toBe('#f9fafb')
    expect(alert.style.getPropertyValue('--ds-alert-text-color')).toBe('#f9fafb')
    expect(alert.style.getPropertyValue('--ds-alert-close-color')).toBe('#f9fafb')
  })

  it('поддерживает tones slate и azure', () => {
    const slate = mount(GrAlert, {
      props: {
        tone: 'slate',
      },
      slots: {
        default: 'Slate body',
      },
    })

    const azure = mount(GrAlert, {
      props: {
        tone: 'azure',
      },
      slots: {
        default: 'Azure body',
      },
    })

    const slateAlert = slate.get('[role="alert"]').element as HTMLDivElement
    const azureAlert = azure.get('[role="alert"]').element as HTMLDivElement

    expect(slateAlert.style.getPropertyValue('--ds-alert-bg')).toBe('var(--ds-slate-light)')
    expect(slateAlert.style.getPropertyValue('--ds-alert-icon-color')).toBe('var(--ds-slate)')
    expect(azureAlert.style.getPropertyValue('--ds-alert-bg')).toBe('var(--ds-azure-light)')
    expect(azureAlert.style.getPropertyValue('--ds-alert-icon-color')).toBe('var(--ds-azure)')
  })
})