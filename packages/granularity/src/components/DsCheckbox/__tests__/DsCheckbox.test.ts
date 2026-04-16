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

import DsCheckbox from '../DsCheckbox.vue'

describe('DsCheckbox', () => {
  it('рисует индикатор и синхронизирует checked у нативного input[type=checkbox]', () => {
    const wrapper = mount(DsCheckbox, {
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
    expect(icon.attributes('class')).toContain('ds-checkbox-icon')
  })

  it('эмитит update:modelValue при изменении', async () => {
    const wrapper = mount(DsCheckbox, {
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
      components: { DsCheckbox },
      data() {
        return {
          checked: true,
        }
      },
      template: `
        <form data-testid="form">
          <DsCheckbox v-model="checked" name="terms" value="1">Terms</DsCheckbox>
        </form>
      `,
    })

    const wrapper = mount(Harness)
    const form = wrapper.get('[data-testid="form"]').element as HTMLFormElement

    expect(new FormData(form).get('terms')).toBe('1')

    await wrapper.get('[role="checkbox"]').trigger('click')
    expect(new FormData(form).get('terms')).toBe(null)
  })
})