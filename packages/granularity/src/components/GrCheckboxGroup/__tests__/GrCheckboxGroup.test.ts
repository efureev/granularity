import { mount } from '@vue/test-utils'
import { computed, defineComponent, h } from 'vue'
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

import GrCheckbox from '../../GrCheckbox/GrCheckbox.vue'
import GrCheckboxGroup from '../GrCheckboxGroup.vue'

const OPTIONS = [
  { value: 'sms', label: 'SMS' },
  { value: 'email', label: 'Email' },
  { value: 'push', label: 'Push' },
]

function mountGroup(props: Record<string, unknown> = {}) {
  return mount(GrCheckboxGroup, {
    props: { modelValue: [], options: OPTIONS, ...props },
  })
}

describe('GrCheckboxGroup', () => {
  it('объявляет role="group" и рисует чекбокс на каждую опцию', () => {
    const wrapper = mountGroup({ ariaLabel: 'Каналы' })

    const root = wrapper.get('[data-gr-checkbox-group]')
    expect(root.attributes('role')).toBe('group')
    expect(root.attributes('aria-label')).toBe('Каналы')
    expect(wrapper.findAll('[role="checkbox"]')).toHaveLength(3)
  })

  it('v-model в обе стороны: отмеченные приходят из массива, клик добавляет и убирает', async () => {
    const wrapper = mountGroup({ modelValue: ['email'] })

    const checkboxes = wrapper.findAll('[role="checkbox"]')
    expect(checkboxes.map(c => c.attributes('aria-checked'))).toEqual(['false', 'true', 'false'])

    await checkboxes[0].trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['email', 'sms']])

    await checkboxes[1].trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[1]).toEqual([[]])
  })

  it('пустой и полный выбор — крайние значения модели', async () => {
    const empty = mountGroup({ modelValue: [] })
    expect(empty.findAll('[role="checkbox"][aria-checked="true"]')).toHaveLength(0)

    const full = mountGroup({ modelValue: ['sms', 'email', 'push'] })
    expect(full.findAll('[role="checkbox"][aria-checked="true"]')).toHaveLength(3)

    // Значение, которого нет среди опций, ничего не ломает и не теряется при снятии.
    const stray = mountGroup({ modelValue: ['email', 'fax'] })
    await stray.findAll('[role="checkbox"]')[1].trigger('click')
    expect(stray.emitted('update:modelValue')?.[0]).toEqual([['fax']])
  })

  it('disabled группы выключает все чекбоксы и не пускает изменения', async () => {
    const wrapper = mountGroup({ modelValue: ['sms'], disabled: true })

    expect(wrapper.get('[data-gr-checkbox-group]').attributes('aria-disabled')).toBe('true')
    for (const control of wrapper.findAll('[role="checkbox"]')) {
      expect(control.attributes('aria-disabled')).toBe('true')
      expect(control.attributes('tabindex')).toBe('-1')
    }

    await wrapper.findAll('[role="checkbox"]')[1].trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
  })

  it('disabled отдельной опции сильнее доступной группы', async () => {
    const wrapper = mountGroup({
      options: [...OPTIONS.slice(0, 2), { value: 'push', label: 'Push', disabled: true }],
    })

    const controls = wrapper.findAll('[role="checkbox"]')
    expect(controls[2].attributes('aria-disabled')).toBe('true')

    await controls[2].trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
  })

  it('readonly: выбор видно и он объявлен, но не меняется', async () => {
    const wrapper = mountGroup({ modelValue: ['sms'], readonly: true })

    // `role="group"` не поддерживает `aria-readonly` (axe: `aria-allowed-attr`) —
    // состояние объявляют сами чекбоксы.
    expect(wrapper.get('[data-gr-checkbox-group]').attributes('aria-readonly')).toBeUndefined()
    expect(wrapper.get('[role="checkbox"]').attributes('aria-readonly')).toBe('true')
    // readonly не выключает контрол — значение по-прежнему уходит в форму.
    expect(wrapper.get('input[type="checkbox"]').attributes('disabled')).toBeUndefined()

    await wrapper.findAll('[role="checkbox"]')[1].trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
  })

  // `aria-invalid` живёт на группе: продублированный на каждом пункте, он заставил бы
  // диктор повторить «неверное значение» столько раз, сколько в группе чекбоксов.
  it('invalid объявляется на группе, а пункты только красит', () => {
    const wrapper = mountGroup({ invalid: true })

    const root = wrapper.get('[data-gr-checkbox-group]')
    expect(root.attributes('aria-invalid')).toBe('true')

    const control = wrapper.get('[role="checkbox"]')
    expect(control.attributes('aria-invalid')).toBeUndefined()
    expect(control.classes()).toContain('border-[var(--gr-danger)]')
  })

  // `role="group"` из ARIA-атрибутов виджета не поддерживает ни `aria-required`,
  // ни `aria-readonly` — axe роняет это как critical `aria-allowed-attr`.
  it('обязательность объявляют чекбоксы, а не контейнер группы', () => {
    const wrapper = mountGroup({ required: true })

    expect(wrapper.get('[data-gr-checkbox-group]').attributes('aria-required')).toBeUndefined()
    for (const control of wrapper.findAll('[role="checkbox"]'))
      expect(control.attributes('aria-required')).toBe('true')
  })

  it('отдаёт в нативную форму одно имя на все отмеченные значения', () => {
    const Harness = defineComponent({
      render: () => h('form', { 'data-testid': 'form' }, [
        h(GrCheckboxGroup, {
          'modelValue': ['sms', 'push'],
          'name': 'channels',
          'options': OPTIONS,
        }),
      ]),
    })

    const wrapper = mount(Harness)
    const form = wrapper.get('[data-testid="form"]').element as HTMLFormElement

    expect(new FormData(form).getAll('channels')).toEqual(['sms', 'push'])
  })

  it('размер группы доезжает до чекбоксов, локальный проп чекбокса сильнее', () => {
    const wrapper = mount(GrCheckboxGroup, {
      props: { modelValue: [], size: 'lg' },
      slots: {
        default: () => [
          h(GrCheckbox, { value: 'sms' }, () => 'SMS'),
          h(GrCheckbox, { value: 'email', size: 'xs' }, () => 'Email'),
        ],
      },
    })

    const controls = wrapper.findAll('[role="checkbox"]')
    expect(controls[0].classes()).toContain('h-5')
    expect(controls[1].classes()).toContain('h-3')
  })

  it('без пропа size берёт размер из GrConfigProvider', () => {
    const wrapper = mount(GrCheckboxGroup, {
      props: { modelValue: [], options: OPTIONS },
      global: {
        provide: {
          [GR_CONFIG_KEY as symbol]: {
            size: computed(() => 'lg'),
            componentDefaults: computed(() => ({ GrCheckboxGroup: { size: 'sm' } })),
          },
        },
      },
    })

    expect(wrapper.get('[role="checkbox"]').classes()).toContain('h-3.5')
  })

  it('слот-режим: чекбоксы без своего v-model работают от модели группы', async () => {
    const wrapper = mount(GrCheckboxGroup, {
      props: { modelValue: ['email'] },
      slots: {
        default: () => [
          h(GrCheckbox, { value: 'sms' }, () => 'SMS'),
          h(GrCheckbox, { value: 'email' }, () => 'Email'),
        ],
      },
    })

    const controls = wrapper.findAll('[role="checkbox"]')
    expect(controls.map(c => c.attributes('aria-checked'))).toEqual(['false', 'true'])

    await controls[0].trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['email', 'sms']])
  })

  it('горизонтальная раскладка меняет только классы контейнера', () => {
    const vertical = mountGroup()
    expect(vertical.get('[data-gr-checkbox-group]').classes()).toContain('grid')

    const horizontal = mountGroup({ direction: 'horizontal' })
    expect(horizontal.get('[data-gr-checkbox-group]').classes()).toContain('flex-wrap')
  })
})
