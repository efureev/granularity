import { mount } from '@vue/test-utils'
import { defineComponent, nextTick } from 'vue'
import { describe, expect, it } from 'vitest'

import GrSidebar, { GrSidebarGroup, GrSidebarItem } from '..'
import { grSidebarCollapseDirection } from '../grSidebarStyles'
import { granularityGlobal } from '../../../testing'

describe('GrSidebar', () => {
  it('рендерит title, subtitle и содержимое слота', () => {
    const wrapper = mount(GrSidebar, {
      props: {
        title: 'Workspace',
        subtitle: 'Administration',
      },
      slots: {
        default: '<nav><a href="#">Overview</a></nav>',
      },
    })

    expect(wrapper.text()).toContain('Workspace')
    expect(wrapper.text()).toContain('Administration')
    expect(wrapper.text()).toContain('Overview')
    expect(wrapper.find('aside').classes()).toContain('border-r')
  })

  it('не рендерит subtitle-блок, если subtitle не передан', () => {
    const wrapper = mount(GrSidebar, {
      props: {
        title: 'Workspace',
      },
    })

    expect(wrapper.text()).toContain('Workspace')
    expect(wrapper.find('.text-\\[var\\(--gr-muted-fg\\)\\]').exists()).toBe(false)
  })

  it('не рендерит header, если нет ни title, ни subtitle, ни кнопки тогла', () => {
    const wrapper = mount(GrSidebar, {
      slots: { default: '<a href="#">Item</a>' },
    })

    expect(wrapper.find('[data-gr-sidebar-header]').exists()).toBe(false)
  })

  it('кнопка тогла сворачивает панель и эмитит update:collapsed', async () => {
    const wrapper = mount(GrSidebar, {
      props: { title: 'Nav', showToggleButton: true },
    })

    const toggle = wrapper.get('[data-gr-sidebar-toggle]')
    await toggle.trigger('click')

    expect(wrapper.emitted('update:collapsed')?.[0]).toEqual([true])
    expect(wrapper.get('aside').attributes('data-collapsed')).toBe('true')
    // Заголовок скрывается в свёрнутом виде.
    expect(wrapper.find('[data-gr-sidebar-title]').exists()).toBe(false)
  })

  it('GrSidebarItem: в свёрнутом виде без иконки показывает первую букву метки', async () => {
    const Host = defineComponent({
      components: { GrSidebar, GrSidebarItem },
      data: () => ({ collapsed: false }),
      template: `
        <GrSidebar v-model:collapsed="collapsed" title="Nav" show-toggle-button>
          <GrSidebarItem label="Billing" />
          <GrSidebarItem label="Overview" icon="i-lucide-home" />
        </GrSidebar>
      `,
    })

    const wrapper = mount(Host)
    // Развёрнуто: видны полные метки.
    expect(wrapper.text()).toContain('Billing')
    expect(wrapper.text()).toContain('Overview')

    ;(wrapper.vm as unknown as { collapsed: boolean }).collapsed = true
    await nextTick()

    const items = wrapper.findAll('[data-gr-sidebar-item]')
    // «Billing» без иконки → первая буква «B», метка уходит в title.
    expect(items[0].text()).toBe('B')
    expect(items[0].attributes('title')).toBe('Billing')
    // «Overview» с иконкой → метка не показывается, но остаётся в title.
    expect(items[1].text()).toBe('')
    expect(items[1].attributes('title')).toBe('Overview')
  })
})
describe('GrSidebar — лендмарк и сторона', () => {
  it('корень по умолчанию aside, landmark="navigation" делает его nav', () => {
    const aside = mount(GrSidebar, { props: { ariaLabel: 'Разделы' } })
    expect(aside.element.tagName).toBe('ASIDE')
    expect(aside.attributes('aria-label')).toBe('Разделы')

    const nav = mount(GrSidebar, { props: { landmark: 'navigation', ariaLabel: 'Основная навигация' } })
    expect(nav.element.tagName).toBe('NAV')
    expect(nav.attributes('aria-label')).toBe('Основная навигация')
  })

  it('position меняет сторону границы и направление шеврона', () => {
    const left = mount(GrSidebar, { props: { showToggleButton: true } })
    expect(left.classes()).toContain('border-r')
    // Развёрнутая левая панель сворачивается влево.
    expect(left.get('[data-gr-sidebar-toggle]').attributes('data-direction')).toBe('left')

    const right = mount(GrSidebar, { props: { showToggleButton: true, position: 'right' } })
    expect(right.classes()).toContain('border-l')
    expect(right.classes()).not.toContain('border-r')
    expect(right.attributes('data-position')).toBe('right')
    expect(right.get('[data-gr-sidebar-toggle]').attributes('data-direction')).toBe('right')
  })

  it('шеврон всегда указывает туда, куда уедет панель', () => {
    expect(grSidebarCollapseDirection('left', false)).toBe('left')
    expect(grSidebarCollapseDirection('left', true)).toBe('right')
    expect(grSidebarCollapseDirection('right', false)).toBe('right')
    expect(grSidebarCollapseDirection('right', true)).toBe('left')
  })

  it('скроллящийся контейнер достижим с клавиатуры', () => {
    const wrapper = mount(GrSidebar)
    const content = wrapper.get('[data-gr-sidebar-content]')

    expect(content.attributes('tabindex')).toBe('0')
    expect(content.classes()).toContain('overflow-y-auto')
    expect(content.classes().some(cls => cls.startsWith('focus-visible:ring-'))).toBe(true)
  })
})

describe('GrSidebar — лейбл тогла и типографика', () => {
  it('лейбл кнопки берётся из локали и меняется вместе с состоянием', async () => {
    const i18n = {
      t: (key: string) => ({
        'gr.sidebar.expand': 'Развернуть панель',
        'gr.sidebar.collapse': 'Свернуть панель',
      }[key] ?? key),
    }

    const wrapper = mount(GrSidebar, {
      props: { showToggleButton: true },
      global: granularityGlobal({ i18n }),
    })

    const toggle = wrapper.get('[data-gr-sidebar-toggle]')
    expect(toggle.attributes('aria-label')).toBe('Свернуть панель')

    await toggle.trigger('click')
    expect(wrapper.get('[data-gr-sidebar-toggle]').attributes('aria-label')).toBe('Развернуть панель')
  })

  it('toggleLabel сильнее локали', () => {
    const wrapper = mount(GrSidebar, { props: { showToggleButton: true, toggleLabel: 'Своя подпись' } })

    expect(wrapper.get('[data-gr-sidebar-toggle]').attributes('aria-label')).toBe('Своя подпись')
  })

  it('кегли заголовка, подзаголовка, буквы и бейджа идут от токенов', async () => {
    const wrapper = mount(GrSidebar, {
      props: { title: 'Workspace', subtitle: 'Navigation' },
      slots: { default: '<GrSidebarItem label="Billing" :badge="4" />' },
      global: { components: { GrSidebarItem } },
    })

    expect(wrapper.get('[data-gr-sidebar-title]').classes()).toContain('text-[length:var(--gr-text-lg)]')
    expect(wrapper.get('[data-gr-sidebar-subtitle]').classes()).toContain('text-[length:var(--gr-text-sm)]')
    expect(wrapper.html()).toContain('text-[length:var(--gr-text-2xs)]')
    expect(wrapper.html()).not.toMatch(/text-\[\d+px\]/)
  })
})

describe('GrSidebarItem — недоступный пункт', () => {
  it('гасится токеном, а не прозрачностью', () => {
    const wrapper = mount(GrSidebarItem, { props: { label: 'Archive', disabled: true } })

    expect(wrapper.classes()).toContain('text-[var(--gr-disabled-fg)]')
    expect(wrapper.classes()).toContain('cursor-not-allowed')
    expect(wrapper.classes().some(cls => cls.startsWith('opacity-'))).toBe(false)
    // Недоступный пункт перестаёт быть кнопкой: `span` не ловит фокус.
    expect(wrapper.element.tagName).toBe('SPAN')
  })
})

describe('GrSidebarGroup', () => {
  function mountGroup(collapsed = false) {
    return mount(GrSidebar, {
      props: { collapsed },
      slots: {
        default: `
          <GrSidebarGroup label="Аналитика">
            <GrSidebarItem label="Отчёты" />
          </GrSidebarGroup>
        `,
      },
      global: { components: { GrSidebarGroup, GrSidebarItem } },
    })
  }

  it('объявляет секцию группой и связывает её с заголовком', () => {
    const wrapper = mountGroup()
    const group = wrapper.get('[data-gr-sidebar-group]')
    const label = wrapper.get('[data-gr-sidebar-group-label]')

    expect(group.attributes('role')).toBe('group')
    expect(group.attributes('aria-labelledby')).toBe(label.attributes('id'))
    expect(label.text()).toBe('Аналитика')
  })

  it('в свёрнутой панели заголовок уходит, а секции разделяет линия', () => {
    const wrapper = mountGroup(true)
    const group = wrapper.get('[data-gr-sidebar-group]')

    expect(wrapper.find('[data-gr-sidebar-group-label]').exists()).toBe(false)
    // Имя из пустоты не берётся: заголовка в DOM нет.
    expect(group.attributes('aria-labelledby')).toBeUndefined()
    expect(group.classes()).toContain('border-t')
  })
})
