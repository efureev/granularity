import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import DsTabs from '../DsTabs.vue'

const tabs = [
  { value: 'overview', label: 'Overview' },
  { value: 'history', label: 'History', badge: '3' },
  { value: 'settings', label: 'Settings' },
] as const

describe('DsTabs', () => {
  it('рендерит вкладки и активное состояние', () => {
    const wrapper = mount(DsTabs, {
      props: {
        modelValue: 'history',
        tabs: [...tabs],
      },
    })

    const renderedTabs = wrapper.findAll('[role="tab"]')

    expect(renderedTabs).toHaveLength(3)
    expect(renderedTabs[1].attributes('aria-selected')).toBe('true')
    expect(wrapper.text()).toContain('3')
  })

  it('эмитит update:modelValue по клику', async () => {
    const wrapper = mount(DsTabs, {
      props: {
        modelValue: 'overview',
        tabs: [...tabs],
      },
    })

    await wrapper.findAll('[role="tab"]')[2].trigger('click')

    expect(wrapper.emitted('update:modelValue')).toEqual([['settings']])
  })

  it('поддерживает клавиатурную навигацию с циклическим переходом', async () => {
    const wrapper = mount(DsTabs, {
      props: {
        modelValue: 'settings',
        tabs: [...tabs],
      },
    })

    await wrapper.get('[role="tablist"]').trigger('keydown', { key: 'ArrowRight' })
    await wrapper.get('[role="tablist"]').trigger('keydown', { key: 'ArrowLeft' })

    expect(wrapper.emitted('update:modelValue')).toEqual([
      ['overview'],
      ['history'],
    ])
  })

  it('игнорирует стрелки при пустом списке вкладок', async () => {
    const wrapper = mount(DsTabs, {
      props: {
        modelValue: '',
        tabs: [],
      },
    })

    await wrapper.get('[role="tablist"]').trigger('keydown', { key: 'ArrowRight' })

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })
})