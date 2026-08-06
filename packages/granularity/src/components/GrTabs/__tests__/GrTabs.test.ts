import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { describe, expect, it } from 'vitest'
import GrTabs from '../GrTabs.vue'

const tabs = [
  { value: 'overview', label: 'Overview' },
  { value: 'history', label: 'History', badge: '3' },
  { value: 'settings', label: 'Settings' },
] as const

describe('GrTabs', () => {
  it('рендерит вкладки и активное состояние', () => {
    const wrapper = mount(GrTabs, {
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
    const wrapper = mount(GrTabs, {
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
    const wrapper = mount(GrTabs, {
      props: {
        modelValue: 'overview',
        tabs: [...tabs],
      },
    })

    await wrapper.findAll('[role="tab"]')[2].trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([['settings']])
  })

  // Стенд с настоящим `v-model`: фокус в tablist едет вместе с выбором, и без
  // обновления модели вторая стрелка отсчитывалась бы от устаревшей вкладки.
  it('поддерживает клавиатурную навигацию с циклическим переходом', async () => {
    const Harness = defineComponent({
      components: { GrTabs },
      data: () => ({ value: 'settings', tabs: [...tabs] }),
      template: '<GrTabs v-model="value" :tabs="tabs" />',
    })

    const wrapper = mount(Harness)
    const state = wrapper.vm as unknown as { value: string }

    await wrapper.get('[role="tablist"]').trigger('keydown', { key: 'ArrowRight' })
    expect(state.value).toBe('overview')

    await wrapper.get('[role="tablist"]').trigger('keydown', { key: 'ArrowLeft' })
    expect(state.value).toBe('settings')
  })

  it('Home/End переводят на первую и последнюю вкладки', async () => {
    const wrapper = mount(GrTabs, {
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
    const wrapper = mount(GrTabs, {
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
    const wrapper = mount(GrTabs, {
      props: {
        modelValue: 'a',
        tabs: tabsWithDisabled,
      },
    })

    await wrapper.get('[role="tablist"]').trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['c'])

    // APG: отключённая вкладка остаётся достижимой и объявленной. Нативный
    // `disabled` убирал её и из таб-порядка, и из объявления скринридером.
    const disabledBtn = wrapper.findAll('[role="tab"]')[1]
    expect(disabledBtn.attributes('aria-disabled')).toBe('true')
    expect(disabledBtn.attributes('disabled')).toBeUndefined()
  })

  it('игнорирует стрелки при пустом списке вкладок', async () => {
    const wrapper = mount(GrTabs, {
      props: {
        modelValue: '',
        tabs: [],
      },
    })

    await wrapper.get('[role="tablist"]').trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })
})

describe('GrTabs — режимы активации и раскладка', () => {
  const three = [
    { value: 'a', label: 'A' },
    { value: 'b', label: 'B' },
    { value: 'c', label: 'C' },
  ]

  // Стрелка в automatic-режиме тянет каждую панель; для тяжёлых вкладок APG
  // предлагает подтверждать выбор вручную.
  it('manual двигает фокус, не меняя выбор до Enter', async () => {
    const wrapper = mount(GrTabs, {
      props: { modelValue: 'a', tabs: three, activationMode: 'manual' },
      attachTo: document.body,
    })

    await wrapper.get('[role="tablist"]').trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.findAll('[role="tab"]')[1].attributes('tabindex')).toBe('0')

    await wrapper.get('[role="tablist"]').trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['b'])

    wrapper.unmount()
  })

  it('vertical переключает стрелки и объявляет ориентацию', async () => {
    const wrapper = mount(GrTabs, {
      props: { modelValue: 'a', tabs: three, orientation: 'vertical' },
    })

    expect(wrapper.get('[role="tablist"]').attributes('aria-orientation')).toBe('vertical')

    await wrapper.get('[role="tablist"]').trigger('keydown', { key: 'ArrowDown' })
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['b'])
  })

  // Массив ref'ов копил отсоединённые узлы: focus() по сократившемуся списку
  // молча проваливался в <body>.
  it('сокращение списка вкладок не роняет фокус', async () => {
    const Harness = defineComponent({
      components: { GrTabs },
      data: () => ({ value: 'a', tabs: [...three] }),
      template: '<GrTabs v-model="value" :tabs="tabs" />',
    })

    const wrapper = mount(Harness, { attachTo: document.body })
    const state = wrapper.vm as unknown as { value: string, tabs: typeof three }

    state.tabs = three.slice(0, 2)
    await wrapper.vm.$nextTick()

    await wrapper.get('[role="tablist"]').trigger('keydown', { key: 'ArrowRight' })
    await wrapper.vm.$nextTick()

    expect(state.value).toBe('b')
    expect(document.activeElement).toBe(wrapper.findAll('[role="tab"]')[1].element)

    wrapper.unmount()
  })
})
