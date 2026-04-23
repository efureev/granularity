import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { describe, expect, it, vi } from 'vitest'

import { GRANULARITY_I18N_KEY, type GranularityI18nAdapter } from '../../../i18n/adapter'

vi.mock('~icons/lucide/menu', () => ({
  default: defineComponent({
    name: 'IconMenu',
    template: '<svg data-icon="menu" />',
  }),
}))

import DsNavbar from '../DsNavbar.vue'

function createI18n(locale: 'en' | 'ru'): GranularityI18nAdapter {
  const messages = {
    en: { 'ds.navbar.openMenu': 'Open menu' },
    ru: { 'ds.navbar.openMenu': 'Открыть меню' },
  } as const
  return {
    t(key) {
      return messages[locale][key as keyof typeof messages.en] ?? key
    },
  }
}

describe('DsNavbar', () => {
  it('рендерит title по пропу и не показывает кнопку меню по умолчанию', () => {
    const wrapper = mount(DsNavbar, {
      props: { title: 'Dashboard' },
    })
    expect(wrapper.text()).toContain('Dashboard')
    expect(wrapper.find('[data-ds-navbar-menu]').exists()).toBe(false)
    expect(wrapper.find('[data-ds-navbar]').exists()).toBe(true)
  })

  it('рендерит кнопку меню при showMenuButton и эмитит `menu` по клику', async () => {
    const wrapper = mount(DsNavbar, {
      props: { title: 'Dashboard', showMenuButton: true, menuButtonClass: 'sm:hidden' },
    })
    const btn = wrapper.find('[data-ds-navbar-menu]')
    expect(btn.exists()).toBe(true)
    expect(btn.classes()).toContain('sm:hidden')
    expect(wrapper.find('[data-icon="menu"]').exists()).toBe(true)
    await btn.trigger('click')
    expect(wrapper.emitted('menu')).toHaveLength(1)
  })

  it('локализует aria-label кнопки меню через i18n-адаптер', () => {
    const wrapper = mount(DsNavbar, {
      props: { title: 'Dashboard', showMenuButton: true },
      global: {
        provide: {
          [GRANULARITY_I18N_KEY as symbol]: createI18n('ru'),
        },
      },
    })
    expect(wrapper.find('[data-ds-navbar-menu]').attributes('aria-label')).toBe('Открыть меню')
  })

  it('поддерживает слот #title и default slot для правых действий', () => {
    const wrapper = mount(DsNavbar, {
      props: { title: 'fallback' },
      slots: {
        title: '<span data-custom-title>Custom</span>',
        default: '<button data-action>Action</button>',
      },
    })
    expect(wrapper.find('[data-custom-title]').exists()).toBe(true)
    expect(wrapper.text()).not.toContain('fallback')
    expect(wrapper.find('[data-action]').exists()).toBe(true)
  })
})
