import { mount } from '@vue/test-utils'
import type { PropType } from 'vue'
import { defineComponent, ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'

vi.mock('~icons/lucide/chevron-down', () => {
  return {
    default: defineComponent({
      name: 'IconChevronDown',
      template: '<svg data-icon="chevron-down" />',
    }),
  }
})

import DsCollapse, { DsCollapseItem, type DsCollapseModelValue } from '..'

const CollapseHarness = defineComponent({
  name: 'CollapseHarness',
  components: {
    DsCollapse,
    DsCollapseItem,
  },
  props: {
    accordion: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    divided: {
      type: Boolean,
      default: true,
    },
    initialValue: {
      type: [Array, String, Number] as PropType<DsCollapseModelValue>,
      default: undefined,
    },
    secondDisabled: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const value = ref<DsCollapseModelValue>(props.initialValue)

    return {
      value,
    }
  },
  template: `
    <DsCollapse
      v-model="value"
      :accordion="accordion"
      :disabled="disabled"
      :divided="divided"
    >
      <DsCollapseItem name="first" title="First item">
        First body
      </DsCollapseItem>
      <DsCollapseItem name="second" title="Second item" :disabled="secondDisabled">
        Second body
      </DsCollapseItem>
    </DsCollapse>
  `,
})

describe('DsCollapse', () => {
  it('раскрывает несколько элементов и эмитит новый массив значений', async () => {
    const wrapper = mount(CollapseHarness, {
      props: {
        initialValue: ['first'],
      },
    })

    const triggers = wrapper.findAll('[data-ds-collapse-trigger]')
    const regions = wrapper.findAll('[role="region"]')

    expect(triggers[0].attributes('aria-expanded')).toBe('true')
    expect(triggers[1].attributes('aria-expanded')).toBe('false')
    expect(regions[0].classes()).toContain('grid-rows-[1fr]')
    expect(regions[1].classes()).toContain('grid-rows-[0fr]')

    await triggers[1].trigger('click')

    expect(wrapper.findComponent(DsCollapse).emitted('change')).toEqual([
      [['first', 'second']],
    ])
    expect(triggers[0].attributes('aria-expanded')).toBe('true')
    expect(triggers[1].attributes('aria-expanded')).toBe('true')
    expect(regions[1].classes()).toContain('grid-rows-[1fr]')
  })

  it('в accordion-режиме оставляет раскрытым только один элемент и позволяет свернуть его повторно', async () => {
    const wrapper = mount(CollapseHarness, {
      props: {
        accordion: true,
        initialValue: 'first',
      },
    })

    const triggers = wrapper.findAll('[data-ds-collapse-trigger]')

    await triggers[1].trigger('click')
    await triggers[1].trigger('click')

    expect(wrapper.findComponent(DsCollapse).emitted('change')).toEqual([
      ['second'],
      [undefined],
    ])
    expect(triggers[0].attributes('aria-expanded')).toBe('false')
    expect(triggers[1].attributes('aria-expanded')).toBe('false')
  })

  it('не переключает disabled-элемент и сохраняет активность для доступных item', async () => {
    const wrapper = mount(CollapseHarness, {
      props: {
        secondDisabled: true,
      },
    })

    const triggers = wrapper.findAll('[data-ds-collapse-trigger]')

    expect(triggers[1].attributes('disabled')).toBeDefined()

    await triggers[1].trigger('click')
    await triggers[0].trigger('click')

    expect(wrapper.findComponent(DsCollapse).emitted('change')).toEqual([
      [['first']],
    ])
    expect(triggers[0].attributes('aria-expanded')).toBe('true')
    expect(triggers[1].attributes('aria-expanded')).toBe('false')
  })

  it('выбрасывает ошибку, если DsCollapseItem используется вне DsCollapse', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    try {
      expect(() => mount(DsCollapseItem, {
        props: {
          title: 'Standalone item',
        },
      })).toThrowError('DsCollapseItem must be used inside DsCollapse')
    }
    finally {
      consoleWarnSpy.mockRestore()
    }
  })
})