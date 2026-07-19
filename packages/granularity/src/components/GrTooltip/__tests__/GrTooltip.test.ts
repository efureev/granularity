import { mount } from '@vue/test-utils'
import { defineComponent, nextTick } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('~icons/lucide/info', () => {
  return {
    default: defineComponent({
      name: 'IconInfo',
      template: '<svg data-icon="info" />',
    }),
  }
})

import GrTooltip from '../GrTooltip.vue'

describe('GrTooltip', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    vi.restoreAllMocks()
  })

  it('рендерит текст tooltip и дефолтную иконку-триггер (панель скрыта до наведения)', () => {
    const wrapper = mount(GrTooltip, {
      attachTo: document.body,
      props: {
        text: 'Helpful hint',
      },
    })

    const trigger = wrapper.get('[data-testid="gr-tooltip-trigger"]')
    expect(trigger.attributes('style')).toContain('color: var(--muted-fg)')
    expect(wrapper.get('[data-icon="info"]')).toBeTruthy()

    const tooltip = document.body.querySelector('[role="tooltip"]')
    expect(tooltip).toBeTruthy()
    expect(tooltip?.textContent).toContain('Helpful hint')
    // v-show="false" по умолчанию — панель в DOM, но скрыта
    expect((tooltip as HTMLElement).style.display).toBe('none')
  })

  it('связывает триггер и tooltip через aria-describedby', () => {
    const wrapper = mount(GrTooltip, {
      attachTo: document.body,
      props: { text: 'Hint' },
    })

    const trigger = wrapper.get('[data-testid="gr-tooltip-trigger"]')
    const tooltip = document.body.querySelector('[role="tooltip"]')

    const describedBy = trigger.attributes('aria-describedby')
    expect(describedBy).toBeTruthy()
    expect(tooltip?.id).toBe(describedBy)
  })

  it('показывается по hover и скрывается при уходе курсора', async () => {
    const wrapper = mount(GrTooltip, {
      attachTo: document.body,
      props: { text: 'Hint' },
    })

    const trigger = wrapper.get('[data-testid="gr-tooltip-trigger"]')
    const tooltip = () => document.body.querySelector('[role="tooltip"]') as HTMLElement

    await trigger.trigger('mouseenter')
    await nextTick()
    expect(tooltip().style.display).not.toBe('none')

    await trigger.trigger('mouseleave')
    await nextTick()
    expect(tooltip().style.display).toBe('none')
  })

  it('показывается по focus и закрывается по Escape', async () => {
    const wrapper = mount(GrTooltip, {
      attachTo: document.body,
      props: { text: 'Hint' },
    })

    const trigger = wrapper.get('[data-testid="gr-tooltip-trigger"]')
    const tooltip = () => document.body.querySelector('[role="tooltip"]') as HTMLElement

    await trigger.trigger('focus')
    await nextTick()
    expect(tooltip().style.display).not.toBe('none')

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()
    expect(tooltip().style.display).toBe('none')
  })

  it('поддерживает кастомный слот и iconColor', () => {
    const wrapper = mount(GrTooltip, {
      attachTo: document.body,
      props: {
        text: 'Custom trigger',
        iconColor: '#0f172a',
      },
      slots: {
        default: '<button type="button" data-testid="custom-trigger">?</button>',
      },
    })

    const trigger = wrapper.get('[data-testid="gr-tooltip-trigger"]')
    expect(trigger.attributes('style')).toContain('color: rgb(15, 23, 42)')
    expect(wrapper.get('[data-testid="custom-trigger"]').text()).toBe('?')
    expect(wrapper.find('[data-icon="info"]').exists()).toBe(false)
  })
})
