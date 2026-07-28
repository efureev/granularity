import { mount } from '@vue/test-utils'
import { computed, defineComponent } from 'vue'
import { describe, expect, it, vi } from 'vitest'

import { GR_CONFIG_KEY } from '../../GrConfigProvider/context'

vi.mock('~icons/lucide/check', () => {
  return {
    default: defineComponent({
      name: 'IconCheck',
      template: '<svg data-icon="check" />',
    }),
  }
})

import GrCheckbox from '../GrCheckbox.vue'

describe('GrCheckbox', () => {
  it('рисует индикатор и синхронизирует checked у нативного input[type=checkbox]', () => {
    const wrapper = mount(GrCheckbox, {
      props: {
        modelValue: true,
      },
      slots: {
        default: 'Label',
      },
    })

    const root = wrapper.get('[role="checkbox"]')
    expect(root.attributes('aria-checked')).toBe('true')

    const native = wrapper.get('input[type="checkbox"]').element as HTMLInputElement
    expect(native.checked).toBe(true)

    const icon = wrapper.get('[data-icon="check"]')
    expect(icon.attributes('class')).toContain('gr-checkbox-icon')
  })

  it('эмитит update:modelValue при изменении', async () => {
    const wrapper = mount(GrCheckbox, {
      props: {
        modelValue: false,
      },
      slots: {
        default: 'Label',
      },
    })

    await wrapper.get('[role="checkbox"]').trigger('click')

    const events = wrapper.emitted('update:modelValue')
    expect(events).toBeTruthy()
    expect(events![0]).toEqual([true])
  })

  it('участвует в html form (FormData) через нативный input', async () => {
    const Harness = defineComponent({
      name: 'Harness',
      components: { GrCheckbox },
      data() {
        return {
          checked: true,
        }
      },
      template: `
        <form data-testid="form">
          <GrCheckbox v-model="checked" name="terms" value="1">Terms</GrCheckbox>
        </form>
      `,
    })

    const wrapper = mount(Harness)
    const form = wrapper.get('[data-testid="form"]').element as HTMLFormElement

    expect(new FormData(form).get('terms')).toBe('1')

    await wrapper.get('[role="checkbox"]').trigger('click')
    expect(new FormData(form).get('terms')).toBe(null)
  })

  it('нативный input — источник истины: change (напр. клик по внешнему label) эмитит модель', async () => {
    const wrapper = mount(GrCheckbox, {
      props: { modelValue: false },
      slots: { default: 'Label' },
    })

    const native = wrapper.get('input[type="checkbox"]')
    // Симулируем нативный клик по `<label for>`: сначала меняется `.checked`, затем `change`.
    ;(native.element as HTMLInputElement).checked = true
    await native.trigger('change')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([true])
  })

  it('indeterminate: aria-checked="mixed", свойство на нативном input и клик → true', async () => {
    const wrapper = mount(GrCheckbox, {
      props: { modelValue: false, indeterminate: true },
      slots: { default: 'Label' },
    })

    expect(wrapper.get('[role="checkbox"]').attributes('aria-checked')).toBe('mixed')
    expect((wrapper.get('input[type="checkbox"]').element as HTMLInputElement).indeterminate).toBe(true)

    await wrapper.get('[role="checkbox"]').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([true])
  })

  // Роль `checkbox` объявляет потомков презентационными: ни нативный input, ни
  // интерактивная подпись не могут жить внутри — скринридер их теряет, axe падает
  // на `nested-interactive`. Поэтому роль висит только на контроле.
  it('не держит внутри role="checkbox" ни нативный input, ни содержимое слота', () => {
    const wrapper = mount(GrCheckbox, {
      props: { modelValue: false },
      slots: { default: '<a href="https://example.com">policy</a>' },
    })

    const control = wrapper.get('[role="checkbox"]')
    expect(control.find('input').exists()).toBe(false)
    expect(control.find('a').exists()).toBe(false)
    expect(wrapper.find('a').exists()).toBe(true)
  })

  it('берёт имя из подписи через aria-labelledby, а без слота — из ariaLabel', () => {
    const withLabel = mount(GrCheckbox, {
      props: { modelValue: false },
      slots: { default: 'Terms' },
    })

    const labelledBy = withLabel.get('[role="checkbox"]').attributes('aria-labelledby')
    expect(labelledBy).toBeTruthy()
    expect(withLabel.get(`[id="${labelledBy}"]`).text()).toBe('Terms')

    const withAriaLabel = mount(GrCheckbox, {
      props: { modelValue: false, ariaLabel: 'Select row' },
    })

    const control = withAriaLabel.get('[role="checkbox"]')
    expect(control.attributes('aria-label')).toBe('Select row')
    expect(control.attributes('aria-labelledby')).toBeUndefined()
  })

  it('переносит required на контрол как aria-required, сохраняя его на нативном input', () => {
    const wrapper = mount(GrCheckbox, {
      props: { modelValue: false, required: true },
      slots: { default: 'Terms' },
    })

    expect(wrapper.get('[role="checkbox"]').attributes('aria-required')).toBe('true')
    expect(wrapper.get('input[type="checkbox"]').attributes('required')).toBeDefined()
  })

  it('клик по подписи переключает значение', async () => {
    const wrapper = mount(GrCheckbox, {
      props: { modelValue: false },
      slots: { default: 'Terms' },
    })

    await wrapper.get('[data-gr-checkbox] > span:last-child').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([true])
  })

  it('Enter больше не переключает (нестандартно для чекбокса), Space — переключает', async () => {
    const wrapper = mount(GrCheckbox, {
      props: { modelValue: false },
      slots: { default: 'Label' },
    })

    await wrapper.get('[role="checkbox"]').trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('update:modelValue')).toBeFalsy()

    await wrapper.get('[role="checkbox"]').trigger('keydown', { key: ' ' })
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([true])
  })

  it('масштабирует контрол, иконку и подпись пропом size', () => {
    const sizes = {
      xs: { control: 'h-3', icon: 'h-2.5', label: 'text-xs' },
      sm: { control: 'h-3.5', icon: 'h-3', label: 'text-sm' },
      md: { control: 'h-4', icon: 'h-3.5', label: 'text-sm' },
      lg: { control: 'h-5', icon: 'h-4', label: 'text-base' },
    } as const

    for (const [size, expected] of Object.entries(sizes)) {
      const wrapper = mount(GrCheckbox, {
        props: { modelValue: true, size: size as keyof typeof sizes },
        slots: { default: 'Label' },
      })

      expect(wrapper.get('[role="checkbox"]').classes()).toContain(expected.control)
      expect(wrapper.get('[data-icon="check"]').classes()).toContain(expected.icon)
      expect(wrapper.get('[data-gr-checkbox] > span:last-child').classes()).toContain(expected.label)
    }
  })

  it('без пропа size берёт размер из GrConfigProvider, локальный проп сильнее', () => {
    const provide = {
      [GR_CONFIG_KEY as symbol]: {
        size: computed(() => 'lg'),
        componentDefaults: computed(() => ({})),
      },
    }

    const fromConfig = mount(GrCheckbox, {
      props: { modelValue: true },
      slots: { default: 'Label' },
      global: { provide },
    })
    expect(fromConfig.get('[role="checkbox"]').classes()).toContain('h-5')

    const localWins = mount(GrCheckbox, {
      props: { modelValue: true, size: 'xs' },
      slots: { default: 'Label' },
      global: { provide },
    })
    expect(localWins.get('[role="checkbox"]').classes()).toContain('h-3')
  })

  it('точечный componentDefaults.GrCheckbox.size сильнее глобального size провайдера', () => {
    const wrapper = mount(GrCheckbox, {
      props: { modelValue: true },
      slots: { default: 'Label' },
      global: {
        provide: {
          [GR_CONFIG_KEY as symbol]: {
            size: computed(() => 'lg'),
            componentDefaults: computed(() => ({ GrCheckbox: { size: 'sm' } })),
          },
        },
      },
    })

    expect(wrapper.get('[role="checkbox"]').classes()).toContain('h-3.5')
  })
})