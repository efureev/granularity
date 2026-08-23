import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { describe, expect, it, vi } from 'vitest'

vi.mock('~icons/lucide/menu', () => ({
  default: defineComponent({
    name: 'IconMenu',
    template: '<svg data-icon="menu" />',
  }),
}))

import GrNavbar from '../GrNavbar.vue'
import type { GranularityI18nAdapter } from '../../../i18n/adapter'
import { granularityGlobal } from '../../../testing'

function createI18n(locale: 'en' | 'ru'): GranularityI18nAdapter {
  const messages = {
    en: { 'gr.navbar.openMenu': 'Open menu' },
    ru: { 'gr.navbar.openMenu': 'Открыть меню' },
  } as const
  return {
    t(key) {
      return messages[locale][key as keyof typeof messages.en] ?? key
    },
  }
}

describe('GrNavbar', () => {
  it('рендерит title по пропу и не показывает кнопку меню по умолчанию', () => {
    const wrapper = mount(GrNavbar, {
      props: { title: 'Dashboard' },
    })
    expect(wrapper.text()).toContain('Dashboard')
    expect(wrapper.find('[data-gr-navbar-menu]').exists()).toBe(false)
    expect(wrapper.find('[data-gr-navbar]').exists()).toBe(true)
  })

  it('рендерит кнопку меню при showMenuButton и эмитит `menu` по клику', async () => {
    const wrapper = mount(GrNavbar, {
      props: { title: 'Dashboard', showMenuButton: true, menuButtonClass: 'sm:hidden' },
    })
    const btn = wrapper.find('[data-gr-navbar-menu]')
    expect(btn.exists()).toBe(true)
    expect(btn.classes()).toContain('sm:hidden')
    expect(wrapper.find('[data-icon="menu"]').exists()).toBe(true)
    await btn.trigger('click')
    expect(wrapper.emitted('menu')).toHaveLength(1)
  })

  it('локализует aria-label кнопки меню через i18n-адаптер', () => {
    const wrapper = mount(GrNavbar, {
      props: { title: 'Dashboard', showMenuButton: true },
      global: granularityGlobal({ i18n: createI18n('ru') }),
    })
    expect(wrapper.find('[data-gr-navbar-menu]').attributes('aria-label')).toBe('Открыть меню')
  })

  it('поддерживает слот #title и default slot для правых действий', () => {
    const wrapper = mount(GrNavbar, {
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

describe('GrNavbar — заголовок, зоны и прилипание', () => {
  it('слот #title работает без пропа и не требует его', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const wrapper = mount(GrNavbar, {
      slots: { title: '<a href="/">Granularity</a>' },
    })

    expect(wrapper.get('[data-gr-navbar-title]').text()).toBe('Granularity')
    // Раньше `title` был обязательным, и разметка в слоте всё равно требовала строку.
    expect(warn).not.toHaveBeenCalled()
    warn.mockRestore()
  })

  it('без заголовка и слота блок заголовка не рендерится', () => {
    const wrapper = mount(GrNavbar)

    expect(wrapper.find('[data-gr-navbar-title]').exists()).toBe(false)
  })

  it('высота идёт от переменной, а не от литерала', () => {
    const wrapper = mount(GrNavbar, { props: { title: 'App' } })

    expect(wrapper.classes()).toContain('h-[var(--gr-navbar-height,56px)]')
    expect(wrapper.html()).not.toMatch(/h-\[\d+px\]/)
    expect(wrapper.get('[data-gr-navbar-title]').classes()).toContain('text-[length:var(--gr-text-sm)]')
  })

  it('sticky прилипает и берёт слой ниже якорных панелей', () => {
    const plain = mount(GrNavbar, { props: { title: 'App' } })
    expect(plain.classes()).not.toContain('sticky')
    expect(plain.attributes('data-sticky')).toBeUndefined()

    const sticky = mount(GrNavbar, { props: { title: 'App', sticky: true } })
    expect(sticky.classes()).toContain('sticky')
    expect(sticky.classes()).toContain('top-0')
    // Не `--gr-z-modal`: шапка обязана оставаться под оверлеями.
    expect(sticky.classes()).toContain('z-[var(--gr-z-navbar)]')
  })

  it('слоты #left и #center рендерятся, а без центра раскладка прежняя', () => {
    const zoned = mount(GrNavbar, {
      props: { title: 'App' },
      slots: {
        left: '<span data-test="left">Tabs</span>',
        center: '<span data-test="center">Search</span>',
        default: '<span data-test="right">Avatar</span>',
      },
    })

    expect(zoned.get('[data-gr-navbar-left] [data-test="left"]').text()).toBe('Tabs')
    expect(zoned.get('[data-gr-navbar-center] [data-test="center"]').text()).toBe('Search')
    expect(zoned.get('[data-gr-navbar-right] [data-test="right"]').text()).toBe('Avatar')

    const plain = mount(GrNavbar, { props: { title: 'App' }, slots: { default: '<span>Avatar</span>' } })
    expect(plain.find('[data-gr-navbar-center]').exists()).toBe(false)
    // Без центральной зоны правая всё равно прижата к краю.
    expect(plain.get('[data-gr-navbar-right]').classes()).toContain('ml-auto')
  })
})
