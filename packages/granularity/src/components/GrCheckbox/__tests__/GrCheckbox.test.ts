import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { describe, expect, it, vi } from 'vitest'

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
})