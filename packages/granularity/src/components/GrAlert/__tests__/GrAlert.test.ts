import { mount } from '@vue/test-utils'
import { computed, defineComponent } from 'vue'
import { describe, expect, it, vi } from 'vitest'

import { GR_CONFIG_KEY } from '../../GrConfigProvider/context'

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

    const alert = wrapper.element as HTMLDivElement

    expect(alert.style.getPropertyValue('--gr-alert-bg')).toBe('#111827')
    expect(alert.style.getPropertyValue('--gr-alert-brd')).toBe('#22c55e')
    expect(alert.style.getPropertyValue('--gr-alert-icon-color')).toBe('#f9fafb')
    expect(alert.style.getPropertyValue('--gr-alert-title-color')).toBe('#f9fafb')
    expect(alert.style.getPropertyValue('--gr-alert-text-color')).toBe('#f9fafb')
    expect(alert.style.getPropertyValue('--gr-alert-close-color')).toBe('#f9fafb')
  })

  it('поддерживает tones slate и azure', () => {
    const slate = mount(GrAlert, { props: { tone: 'slate' }, slots: { default: 'Slate body' } })
    const azure = mount(GrAlert, { props: { tone: 'azure' }, slots: { default: 'Azure body' } })

    const slateAlert = slate.element as HTMLDivElement
    const azureAlert = azure.element as HTMLDivElement

    expect(slateAlert.style.getPropertyValue('--gr-alert-bg')).toBe('var(--gr-slate-light)')
    expect(slateAlert.style.getPropertyValue('--gr-alert-icon-color')).toBe('var(--gr-slate-text)')
    expect(azureAlert.style.getPropertyValue('--gr-alert-bg')).toBe('var(--gr-azure-light)')
    expect(azureAlert.style.getPropertyValue('--gr-alert-icon-color')).toBe('var(--gr-azure-text)')
  })

  describe('live-регион', () => {
    it('warning и danger объявляются assertive (role=alert)', () => {
      for (const tone of ['warning', 'danger'] as const) {
        const wrapper = mount(GrAlert, { props: { tone }, slots: { default: 'Body' } })
        expect(wrapper.attributes('role'), tone).toBe('alert')
      }
    })

    it('спокойные тоны не перебивают речь (role=status)', () => {
      for (const tone of ['info', 'success', 'primary', 'neutral', 'slate', 'azure'] as const) {
        const wrapper = mount(GrAlert, { props: { tone }, slots: { default: 'Body' } })
        expect(wrapper.attributes('role'), tone).toBe('status')
      }
    })

    it('проп live перекрывает вывод по тону', () => {
      expect(mount(GrAlert, { props: { tone: 'danger', live: 'polite' } }).attributes('role')).toBe('status')
      expect(mount(GrAlert, { props: { tone: 'info', live: 'assertive' } }).attributes('role')).toBe('alert')
      expect(mount(GrAlert, { props: { tone: 'info', live: 'off' } }).attributes('role')).toBeUndefined()
    })
  })

  it('кнопка закрытия фокусируема с клавиатуры и имеет видимый фокус', () => {
    const wrapper = mount(GrAlert, { props: { closable: true }, slots: { default: 'Body' } })
    const btn = wrapper.get('button[aria-label="Close"]')

    expect(btn.attributes('type')).toBe('button')
    expect(btn.classes().join(' ')).toContain('focus-visible:ring-2')
  })

  it('читает дефолты из GrConfigProvider', () => {
    const wrapper = mount(GrAlert, {
      props: { closable: undefined },
      slots: { default: 'Body' },
      global: {
        provide: {
          [GR_CONFIG_KEY as symbol]: {
            size: computed(() => undefined),
            componentDefaults: computed(() => ({ GrAlert: { tone: 'danger', closable: true } })),
          },
        },
      },
    })

    expect((wrapper.element as HTMLDivElement).style.getPropertyValue('--gr-alert-bg')).toBe('var(--gr-danger-light)')
    expect(wrapper.find('button[aria-label="Close"]').exists()).toBe(true)
  })

  it('локальный проп сильнее дефолта из провайдера', () => {
    const wrapper = mount(GrAlert, {
      props: { tone: 'success' },
      slots: { default: 'Body' },
      global: {
        provide: {
          [GR_CONFIG_KEY as symbol]: {
            size: computed(() => undefined),
            componentDefaults: computed(() => ({ GrAlert: { tone: 'danger' } })),
          },
        },
      },
    })

    expect((wrapper.element as HTMLDivElement).style.getPropertyValue('--gr-alert-bg')).toBe('var(--gr-success-light)')
  })

  describe('иконка', () => {
    it('по умолчанию рендерит глиф тона', () => {
      const wrapper = mount(GrAlert, { props: { tone: 'success' }, slots: { default: 'Body' } })

      expect(wrapper.find('[data-gr-alert-icon]').exists()).toBe(true)
      expect(wrapper.find('[data-icon="check-circle"]').exists()).toBe(true)
    })

    it('`icon: false` убирает иконку целиком', () => {
      const wrapper = mount(GrAlert, { props: { tone: 'success', icon: false }, slots: { default: 'Body' } })

      expect(wrapper.find('[data-gr-alert-icon]').exists()).toBe(false)
      expect(wrapper.find('[data-icon="check-circle"]').exists()).toBe(false)
    })

    it('слот подменяет глиф, оставляя иконку декоративной', () => {
      const wrapper = mount(GrAlert, {
        props: { tone: 'success' },
        slots: { default: 'Body', icon: '<span data-custom-icon />' },
      })

      const icon = wrapper.get('[data-gr-alert-icon]')

      expect(icon.attributes('aria-hidden')).toBe('true')
      expect(icon.find('[data-custom-icon]').exists()).toBe(true)
      expect(wrapper.find('[data-icon="check-circle"]').exists()).toBe(false)
    })
  })

  describe('действия', () => {
    it('блок действий появляется только со слотом', () => {
      const without = mount(GrAlert, { slots: { default: 'Body' } })
      expect(without.find('[data-gr-alert-actions]').exists()).toBe(false)

      const withActions = mount(GrAlert, {
        slots: { default: 'Body', actions: '<button>Retry</button>' },
      })

      expect(withActions.get('[data-gr-alert-actions]').text()).toBe('Retry')
    })
  })

  describe('видимость', () => {
    /**
     * Защита от случайного перехода на uncontrolled-семантику: без пропа
     * `visible` кнопка закрытия обязана только сообщать о намерении. Иначе
     * потребитель, спрашивающий по `close` подтверждение, потеряет сообщение
     * до ответа.
     */
    it('без пропа `visible` алерт остаётся в DOM после закрытия', async () => {
      const wrapper = mount(GrAlert, { props: { closable: true }, slots: { default: 'Body' } })

      await wrapper.get('button[aria-label="Close"]').trigger('click')

      expect(wrapper.find('[data-gr-alert]').exists()).toBe(true)
    })

    it('`visible: false` не рендерит сообщение', () => {
      const wrapper = mount(GrAlert, { props: { visible: false }, slots: { default: 'Body' } })

      expect(wrapper.find('[data-gr-alert]').exists()).toBe(false)
    })

    it('кнопка закрытия шлёт и `update:visible`, и `close`', async () => {
      const wrapper = mount(GrAlert, {
        props: { closable: true, visible: true },
        slots: { default: 'Body' },
      })

      await wrapper.get('button[aria-label="Close"]').trigger('click')

      expect(wrapper.emitted('update:visible')).toEqual([[false]])
      expect(wrapper.emitted('close')?.length).toBe(1)
    })
  })

  it('`live` читается из GrConfigProvider', () => {
    const wrapper = mount(GrAlert, {
      props: { tone: 'danger' },
      slots: { default: 'Body' },
      global: {
        provide: {
          [GR_CONFIG_KEY as symbol]: {
            size: computed(() => undefined),
            componentDefaults: computed(() => ({ GrAlert: { live: 'polite' } })),
          },
        },
      },
    })

    // `danger` сам по себе дал бы `alert`; провайдер успокаивает весь пакет.
    expect(wrapper.attributes('role')).toBe('status')
  })

  it('локальный `live` сильнее дефолта провайдера', () => {
    const wrapper = mount(GrAlert, {
      props: { tone: 'info', live: 'assertive' },
      slots: { default: 'Body' },
      global: {
        provide: {
          [GR_CONFIG_KEY as symbol]: {
            size: computed(() => undefined),
            componentDefaults: computed(() => ({ GrAlert: { live: 'polite' } })),
          },
        },
      },
    })

    expect(wrapper.attributes('role')).toBe('alert')
  })
})
