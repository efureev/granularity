import { mount } from '@vue/test-utils'
import { defineComponent, nextTick } from 'vue'
import { describe, expect, it } from 'vitest'

import GrConfigProvider from '../../GrConfigProvider/GrConfigProvider.vue'
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

  it('пустой список не рендерит tablist: роль обязана владеть вкладками', () => {
    const wrapper = mount(GrTabs, {
      props: {
        modelValue: '',
        tabs: [],
      },
    })

    // Пустая роль с текстом внутри — нарушение `aria-required-children`, а не
    // пустое состояние.
    expect(wrapper.find('[role="tablist"]').exists()).toBe(false)
    expect(wrapper.get('[data-gr-tabs-empty]').text()).toBe('Nothing here yet')
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

describe('GrTabs — вид и содержимое вкладки', () => {
  const baseProps = { modelValue: 'overview', tabs: [...tabs] }

  it('pills — обойма с рамкой, line — ряд с подчёркиванием активной', () => {
    const pills = mount(GrTabs, { props: baseProps })
    expect(pills.get('[role="tablist"]').classes()).toContain('bg-[var(--gr-muted)]')
    expect(pills.get('[data-gr-tab]').classes()).toContain('bg-[var(--gr-card)]')

    const line = mount(GrTabs, { props: { ...baseProps, variant: 'line' } })
    const list = line.get('[role="tablist"]')
    expect(list.classes()).toContain('border-b')
    expect(list.classes()).not.toContain('bg-[var(--gr-muted)]')

    const active = line.get('[data-gr-tab]')
    expect(active.classes()).toContain('border-[var(--gr-primary)]')
    expect(active.classes()).not.toContain('bg-[var(--gr-card)]')
  })

  it('вариант читается из GrConfigProvider, локальный проп сильнее', () => {
    const Harness = defineComponent({
      components: { GrConfigProvider, GrTabs },
      props: { variant: { type: String, default: undefined } },
      setup: () => ({ tabs: [...tabs] }),
      template: `
        <GrConfigProvider :component-defaults="{ GrTabs: { variant: 'line' } }">
          <GrTabs model-value="overview" :tabs="tabs" :variant="variant" />
        </GrConfigProvider>
      `,
    })

    expect(mount(Harness).get('[role="tablist"]').classes()).toContain('border-b')
    expect(mount(Harness, { props: { variant: 'pills' } }).get('[role="tablist"]').classes())
      .toContain('bg-[var(--gr-muted)]')
  })

  it('иконка вкладки рендерится декоративной', () => {
    const wrapper = mount(GrTabs, {
      props: {
        modelValue: 'overview',
        tabs: [{ value: 'overview', label: 'Overview', icon: 'i-lucide-home' }],
      },
    })

    const icon = wrapper.get('.i-lucide-home')
    expect(icon.attributes('aria-hidden')).toBe('true')
  })

  it('слот #tab заменяет содержимое и получает состояние вкладки', () => {
    const wrapper = mount(GrTabs, {
      props: baseProps,
      slots: {
        tab: `<template #tab="{ tab, active, disabled }">
          <span class="custom">{{ tab.label }}:{{ active }}:{{ disabled }}</span>
        </template>`,
      },
    })

    const rendered = wrapper.findAll('.custom').map(node => node.text())
    expect(rendered).toEqual(['Overview:true:false', 'History:false:false', 'Settings:false:false'])
    // Счётчик из пропа больше не рисуется: слот заменяет содержимое целиком.
    expect(wrapper.text()).not.toContain('3')
  })

  it('горизонтальный ряд прокручивается, вертикальный — колонка', () => {
    const horizontal = mount(GrTabs, { props: baseProps })
    expect(horizontal.get('[role="tablist"]').classes()).toContain('overflow-x-auto')

    const vertical = mount(GrTabs, { props: { ...baseProps, orientation: 'vertical' } })
    const list = vertical.get('[role="tablist"]')
    expect(list.classes()).toContain('flex-col')
    expect(list.classes()).not.toContain('overflow-x-auto')
  })

  it('смена активной вкладки подтягивает её в видимую часть ряда', async () => {
    const wrapper = mount(GrTabs, { props: baseProps, attachTo: document.body })
    const scrolled: unknown[] = []
    for (const button of wrapper.findAll('[data-gr-tab]'))
      (button.element as HTMLElement).scrollIntoView = (...args: unknown[]) => scrolled.push(args)

    await wrapper.setProps({ modelValue: 'settings' })
    await nextTick()

    expect(scrolled).toHaveLength(1)
    wrapper.unmount()
  })

  it('кегли идут от токенов --gr-text-*', () => {
    const xs = mount(GrTabs, { props: { ...baseProps, size: 'xs' } })
    expect(xs.get('[data-gr-tab]').classes()).toContain('text-[length:var(--gr-text-xs)]')
    expect(xs.html()).not.toMatch(/text-\[\d+px\]/)

    const lg = mount(GrTabs, { props: { ...baseProps, size: 'lg' } })
    expect(lg.get('[data-gr-tab]').classes()).toContain('text-[length:var(--gr-text-base)]')
    expect(lg.html()).not.toMatch(/text-\[\d+px\]/)
  })
})

describe('GrTabs — пустой ряд', () => {
  const emptyProps = { modelValue: '', tabs: [] }

  it('emptyText перекрывает текст из локали, слот #empty сильнее обоих', () => {
    const fromLocale = mount(GrTabs, { props: emptyProps })
    expect(fromLocale.get('[data-gr-tabs-empty]').text()).toBe('Nothing here yet')

    const fromProp = mount(GrTabs, { props: { ...emptyProps, emptyText: 'Нет открытых файлов' } })
    expect(fromProp.get('[data-gr-tabs-empty]').text()).toBe('Нет открытых файлов')

    const fromSlot = mount(GrTabs, {
      props: { ...emptyProps, emptyText: 'Нет открытых файлов' },
      slots: { empty: '<b class="own">Откройте файл</b>' },
    })
    expect(fromSlot.get('.own').text()).toBe('Откройте файл')
    expect(fromSlot.text()).not.toContain('Нет открытых файлов')
  })

  it('пустой ряд держит высоту вкладки', () => {
    const wrapper = mount(GrTabs, { props: { ...emptyProps, size: 'lg' } })

    // Иначе соседние блоки прыгают, когда закрыли последнюю вкладку.
    expect(wrapper.get('[data-gr-tabs-empty]').classes()).toContain('h-10')
  })
})

describe('GrTabs — закрываемые вкладки', () => {
  const closableTabs = [
    { value: 'home', label: 'Home', closable: false },
    { value: 'a', label: 'file-a.ts' },
    { value: 'b', label: 'file-b.ts' },
  ]

  function mountClosable(props: Record<string, unknown> = {}) {
    return mount(GrTabs, {
      props: { modelValue: 'a', tabs: [...closableTabs], closable: true, ...props },
      attachTo: document.body,
    })
  }

  it('closable ряда включает крестик, closable вкладки его снимает', () => {
    const wrapper = mountClosable()
    const buttons = wrapper.findAll('[role="tab"]')

    expect(buttons[0].find('[data-gr-tab-close]').exists()).toBe(false)
    expect(buttons[1].find('[data-gr-tab-close]').exists()).toBe(true)
    expect(buttons[2].find('[data-gr-tab-close]').exists()).toBe(true)

    wrapper.unmount()
  })

  it('без пропа ряда закрывается только вкладка, попросившая об этом', () => {
    const wrapper = mount(GrTabs, {
      props: {
        modelValue: 'a',
        tabs: [{ value: 'a', label: 'A' }, { value: 'b', label: 'B', closable: true }],
      },
    })

    const buttons = wrapper.findAll('[role="tab"]')
    expect(buttons[0].find('[data-gr-tab-close]').exists()).toBe(false)
    expect(buttons[1].find('[data-gr-tab-close]').exists()).toBe(true)
  })

  it('крестик не интерактивен и скрыт от скринридера, клавиша объявлена', () => {
    const wrapper = mountClosable()
    const close = wrapper.get('[data-gr-tab-close]')

    // Кнопка внутри `role="tab"` потерялась бы у скринридера (nested-interactive),
    // поэтому про закрытие сообщает `aria-keyshortcuts` самой вкладки.
    expect(close.element.tagName).toBe('SPAN')
    expect(close.attributes('aria-hidden')).toBe('true')

    const buttons = wrapper.findAll('[role="tab"]')
    expect(buttons[0].attributes('aria-keyshortcuts')).toBeUndefined()
    expect(buttons[1].attributes('aria-keyshortcuts')).toBe('Delete')

    wrapper.unmount()
  })

  it('клик по крестику закрывает, клик мимо него — выбирает', async () => {
    const wrapper = mountClosable()
    const buttons = wrapper.findAll('[role="tab"]')

    await buttons[2].get('[data-gr-tab-close]').trigger('click')
    expect(wrapper.emitted('close')).toEqual([['b']])
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()

    await buttons[2].trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(1)
    expect(wrapper.emitted('update:modelValue')).toEqual([['b']])

    wrapper.unmount()
  })

  it('Delete и Backspace закрывают вкладку под фокусом', async () => {
    const wrapper = mountClosable()
    const list = wrapper.get('[role="tablist"]')

    await list.trigger('keydown', { key: 'Delete' })
    expect(wrapper.emitted('close')).toEqual([['a']])

    // Фокус уехал вперёд выбора — закрывается именно он, а не активная вкладка.
    await list.trigger('keydown', { key: 'ArrowRight' })
    await nextTick()
    await list.trigger('keydown', { key: 'Backspace' })
    expect(wrapper.emitted('close')).toEqual([['a'], ['b']])

    wrapper.unmount()
  })

  it('незакрываемая вкладка не поддаётся ни крестику, ни клавише', async () => {
    const wrapper = mountClosable({ modelValue: 'home' })

    await wrapper.get('[role="tablist"]').trigger('keydown', { key: 'Delete' })
    expect(wrapper.emitted('close')).toBeUndefined()

    wrapper.unmount()
  })

  it('отключённая вкладка не закрывается: aria-disabled — это про всё взаимодействие', async () => {
    const wrapper = mount(GrTabs, {
      props: {
        modelValue: 'a',
        tabs: [{ value: 'a', label: 'A' }, { value: 'b', label: 'B', disabled: true }],
        closable: true,
      },
    })

    const buttons = wrapper.findAll('[role="tab"]')
    expect(buttons[1].find('[data-gr-tab-close]').exists()).toBe(false)
    expect(buttons[1].attributes('aria-keyshortcuts')).toBeUndefined()

    await buttons[1].trigger('click')
    expect(wrapper.emitted('close')).toBeUndefined()
  })

  it('слот #tab не отнимает крестик у своей разметки', () => {
    const wrapper = mount(GrTabs, {
      props: { modelValue: 'a', tabs: [{ value: 'a', label: 'A' }], closable: true },
      slots: { tab: '<template #tab="{ tab }"><span class="custom">{{ tab.label }}</span></template>' },
    })

    expect(wrapper.get('.custom').exists()).toBe(true)
    expect(wrapper.find('[data-gr-tab-close]').exists()).toBe(true)
  })

  it('фокус после закрытия остаётся в ряду, а не падает в body', async () => {
    const wrapper = mountClosable()
    const buttons = wrapper.findAll('[role="tab"]')

    ;(buttons[1].element as HTMLElement).focus()
    await buttons[1].get('[data-gr-tab-close]').trigger('click')

    // Потребитель убрал вкладку из списка — фокус переезжает на её место.
    await wrapper.setProps({ tabs: [closableTabs[0], closableTabs[2]] })
    await nextTick()
    await nextTick()

    expect(document.activeElement).toBe(wrapper.findAll('[role="tab"]')[1].element)

    wrapper.unmount()
  })

  it('отменённое закрытие фокус не двигает', async () => {
    const wrapper = mountClosable()
    const buttons = wrapper.findAll('[role="tab"]')

    ;(buttons[2].element as HTMLElement).focus()
    await buttons[2].get('[data-gr-tab-close]').trigger('click')

    // Потребитель спросил «сохранить изменения?» и список не тронул.
    await nextTick()
    expect(document.activeElement).toBe(buttons[2].element)

    wrapper.unmount()
  })
})
