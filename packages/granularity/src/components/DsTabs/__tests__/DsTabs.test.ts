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

  it('использует roving tabindex (активная — 0, остальные — -1)', () => {
    const wrapper = mount(DsTabs, {
      props: {
        modelValue: 'history',
        tabs: [...tabs],
      },
    })

    const renderedTabs = wrapper.findAll('[role="tab"]')
    expect(renderedTabs[0].attributes('tabindex')).toBe('-1')
    expect(renderedTabs[1].attributes('tabindex')).toBe('0')
    expect(renderedTabs[2].attributes('tabindex')).toBe('-1')
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

  it('Home/End переводят на первую и последнюю вкладки', async () => {
    const wrapper = mount(DsTabs, {
      props: {
        modelValue: 'history',
        tabs: [...tabs],
      },
    })

    await wrapper.get('[role="tablist"]').trigger('keydown', { key: 'End' })
    await wrapper.get('[role="tablist"]').trigger('keydown', { key: 'Home' })

    expect(wrapper.emitted('update:modelValue')).toEqual([
      ['settings'],
      ['overview'],
    ])
  })

  it('переносит DOM-фокус на новую вкладку при стрелках', async () => {
    const wrapper = mount(DsTabs, {
      attachTo: document.body,
      props: {
        modelValue: 'overview',
        tabs: [...tabs],
      },
    })

    await wrapper.get('[role="tablist"]').trigger('keydown', { key: 'ArrowRight' })
    await wrapper.setProps({ modelValue: 'history' })
    await wrapper.vm.$nextTick()

    const buttons = wrapper.findAll('[role="tab"]')
    expect(document.activeElement).toBe(buttons[1].element)

    wrapper.unmount()
  })

  it('пропускает disabled вкладки при навигации стрелками', async () => {
    const tabsWithDisabled = [
      { value: 'a', label: 'A' },
      { value: 'b', label: 'B', disabled: true },
      { value: 'c', label: 'C' },
    ]
    const wrapper = mount(DsTabs, {
      props: {
        modelValue: 'a',
        tabs: tabsWithDisabled,
      },
    })

    await wrapper.get('[role="tablist"]').trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['c'])

    const disabledBtn = wrapper.findAll('[role="tab"]')[1]
    expect(disabledBtn.attributes('aria-disabled')).toBe('true')
    expect(disabledBtn.attributes('disabled')).toBeDefined()
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
