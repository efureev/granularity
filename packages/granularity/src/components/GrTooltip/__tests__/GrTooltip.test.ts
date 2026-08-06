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
    expect(trigger.attributes('style')).toContain('color: var(--gr-muted-fg)')
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

    await trigger.trigger('focusin')
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

describe('GrTooltip — триггер', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('дефолтная иконка — сама остановка Tab', () => {
    const wrapper = mount(GrTooltip, { attachTo: document.body, props: { text: 'Hint' } })
    const trigger = wrapper.get('[data-testid="gr-tooltip-trigger"]')

    expect(trigger.attributes('tabindex')).toBe('0')
    expect(trigger.attributes('aria-describedby')).toBeTruthy()
  })

  it('фокусируемый слот забирает описание себе — один таб-стоп вместо двух', async () => {
    const wrapper = mount(GrTooltip, {
      attachTo: document.body,
      props: { text: 'Hint' },
      slots: { default: '<button type="button" data-testid="custom-trigger">?</button>' },
    })
    await nextTick()

    const trigger = wrapper.get('[data-testid="gr-tooltip-trigger"]')
    const button = wrapper.get('[data-testid="custom-trigger"]')

    expect(trigger.attributes('tabindex')).toBeUndefined()
    expect(trigger.attributes('aria-describedby')).toBeUndefined()
    expect(button.attributes('aria-describedby')).toBe(document.body.querySelector('[role="tooltip"]')?.id)
  })

  it('нефокусируемому слоту обёртка остаётся остановкой Tab', async () => {
    const wrapper = mount(GrTooltip, {
      attachTo: document.body,
      props: { text: 'Hint' },
      slots: { default: '<span>цена</span>' },
    })
    await nextTick()

    expect(wrapper.get('[data-testid="gr-tooltip-trigger"]').attributes('tabindex')).toBe('0')
  })

  it('тап показывает и скрывает подсказку — на тач-устройствах hover нет', async () => {
    const wrapper = mount(GrTooltip, { attachTo: document.body, props: { text: 'Hint' } })
    const trigger = wrapper.get('[data-testid="gr-tooltip-trigger"]')
    const tooltip = () => document.body.querySelector('[role="tooltip"]') as HTMLElement

    await trigger.trigger('touchstart')
    expect(tooltip().style.display).not.toBe('none')

    await trigger.trigger('touchstart')
    expect(tooltip().style.display).toBe('none')
  })
})

describe('GrTooltip — содержимое и управление', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    vi.useRealTimers()
  })

  it('слот #content заменяет текстовый проп', async () => {
    mount(GrTooltip, {
      attachTo: document.body,
      slots: { content: '<b data-testid="rich">12 из 30</b>' },
    })
    await nextTick()

    expect(document.body.querySelector('[role="tooltip"] [data-testid="rich"]')?.textContent).toBe('12 из 30')
  })

  it('disabled не даёт показать подсказку ничем', async () => {
    const wrapper = mount(GrTooltip, {
      attachTo: document.body,
      props: { text: 'Hint', disabled: true, open: true },
    })
    await nextTick()

    const tooltip = () => document.body.querySelector('[role="tooltip"]') as HTMLElement
    expect(tooltip().style.display).toBe('none')

    await wrapper.get('[data-testid="gr-tooltip-trigger"]').trigger('mouseenter')
    expect(tooltip().style.display).toBe('none')
  })

  it('пустая подсказка не открывается', async () => {
    const wrapper = mount(GrTooltip, { attachTo: document.body })

    await wrapper.get('[data-testid="gr-tooltip-trigger"]').trigger('mouseenter')
    await nextTick()

    expect((document.body.querySelector('[role="tooltip"]') as HTMLElement).style.display).toBe('none')
  })

  it('v-model:open ведёт видимость снаружи', async () => {
    const wrapper = mount(GrTooltip, {
      attachTo: document.body,
      props: { text: 'Hint', open: false },
    })
    const tooltip = () => document.body.querySelector('[role="tooltip"]') as HTMLElement

    await wrapper.get('[data-testid="gr-tooltip-trigger"]').trigger('mouseenter')
    // Пока владелец не обновил проп, подсказка остаётся скрытой.
    expect(tooltip().style.display).toBe('none')
    expect(wrapper.emitted('update:open')).toEqual([[true]])

    await wrapper.setProps({ open: true })
    expect(tooltip().style.display).not.toBe('none')
  })

  it('openDelay и closeDelay откладывают показ и скрытие', async () => {
    vi.useFakeTimers()
    const wrapper = mount(GrTooltip, {
      attachTo: document.body,
      props: { text: 'Hint', openDelay: 300, closeDelay: 200 },
    })

    const trigger = wrapper.get('[data-testid="gr-tooltip-trigger"]')
    const tooltip = () => document.body.querySelector('[role="tooltip"]') as HTMLElement

    await trigger.trigger('mouseenter')
    expect(tooltip().style.display).toBe('none')

    await vi.advanceTimersByTimeAsync(300)
    await nextTick()
    expect(tooltip().style.display).not.toBe('none')

    await trigger.trigger('mouseleave')
    expect(tooltip().style.display).not.toBe('none')

    await vi.advanceTimersByTimeAsync(200)
    await nextTick()
    expect(tooltip().style.display).toBe('none')
  })

  it('быстрый проход курсором не успевает открыть подсказку', async () => {
    vi.useFakeTimers()
    const wrapper = mount(GrTooltip, {
      attachTo: document.body,
      props: { text: 'Hint', openDelay: 300 },
    })

    const trigger = wrapper.get('[data-testid="gr-tooltip-trigger"]')

    await trigger.trigger('mouseenter')
    await vi.advanceTimersByTimeAsync(100)
    await trigger.trigger('mouseleave')
    await vi.advanceTimersByTimeAsync(500)
    await nextTick()

    expect((document.body.querySelector('[role="tooltip"]') as HTMLElement).style.display).toBe('none')
  })
})
