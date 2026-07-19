import { mount } from '@vue/test-utils'
import { defineComponent, nextTick } from 'vue'
import { describe, expect, it } from 'vitest'

import GrSidebar, { GrSidebarItem } from '..'

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
    expect(wrapper.find('.text-\\[var\\(--muted-fg\\)\\]').exists()).toBe(false)
  })

  it('не рендерит header, если нет ни title, ни subtitle, ни кнопки тогла', () => {
    const wrapper = mount(GrSidebar, {
      slots: { default: '<a href="#">Item</a>' },
    })

    expect(wrapper.find('[data-ds-sidebar-header]').exists()).toBe(false)
  })

  it('кнопка тогла сворачивает панель и эмитит update:collapsed', async () => {
    const wrapper = mount(GrSidebar, {
      props: { title: 'Nav', showToggleButton: true },
    })

    const toggle = wrapper.get('[data-ds-sidebar-toggle]')
    await toggle.trigger('click')

    expect(wrapper.emitted('update:collapsed')?.[0]).toEqual([true])
    expect(wrapper.get('aside').attributes('data-collapsed')).toBe('true')
    // Заголовок скрывается в свёрнутом виде.
    expect(wrapper.find('[data-ds-sidebar-title]').exists()).toBe(false)
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

    const items = wrapper.findAll('[data-ds-sidebar-item]')
    // «Billing» без иконки → первая буква «B», метка уходит в title.
    expect(items[0].text()).toBe('B')
    expect(items[0].attributes('title')).toBe('Billing')
    // «Overview» с иконкой → метка не показывается, но остаётся в title.
    expect(items[1].text()).toBe('')
    expect(items[1].attributes('title')).toBe('Overview')
  })
})