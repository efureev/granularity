import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { describe, expect, it } from 'vitest'

import GrBottomNav from '../GrBottomNav.vue'

const items = [
  { value: 'home', label: 'Home' },
  { value: 'profile', label: 'Profile' },
]

function mountNav(props: Record<string, unknown> = {}) {
  return mount(GrBottomNav, { props: { modelValue: 'home', items, ...props } })
}

describe('GrBottomNav', () => {
  it('рендерит элементы и подсвечивает активный', () => {
    const wrapper = mountNav()
    const buttons = wrapper.findAll('button')

    expect(buttons).toHaveLength(2)
    expect(buttons[0].classes()).toContain('text-[var(--gr-primary-text)]')
    expect(buttons[1].classes()).toContain('text-[var(--gr-muted-fg)]')
  })

  it('эмитит update:modelValue по клику', async () => {
    const wrapper = mountNav()

    await wrapper.findAll('button')[1].trigger('click')

    expect(wrapper.emitted('update:modelValue')).toEqual([['profile']])
  })
})

describe('GrBottomNav — где пользователь', () => {
  it('активный пункт объявлен aria-current, остальные — нет', () => {
    const wrapper = mountNav({ modelValue: 'profile' })
    const buttons = wrapper.findAll('button')

    expect(buttons[0].attributes('aria-current')).toBeUndefined()
    expect(buttons[1].attributes('aria-current')).toBe('page')
  })

  it('активный отличается не только цветом', () => {
    const active = mountNav().findAll('button')[0]

    // WCAG 1.4.1: цвет не единственный носитель смысла — подложка и вес тоже.
    expect(active.classes()).toContain('bg-[var(--gr-muted)]')
    expect(active.classes()).toContain('font-600')
  })

  it('лендмарк назван из локали, ariaLabel сильнее', async () => {
    const wrapper = mountNav()
    expect(wrapper.get('nav').attributes('aria-label')).toBe('Bottom navigation')

    await wrapper.setProps({ ariaLabel: 'Разделы приложения' })
    expect(wrapper.get('nav').attributes('aria-label')).toBe('Разделы приложения')
  })
})

describe('GrBottomNav — пункт', () => {
  it('иконка декоративна', () => {
    const wrapper = mountNav({
      items: [{ value: 'home', label: 'Home', icon: 'i-lucide-home' }],
    })
    const icon = wrapper.get('.i-lucide-home')

    // Подпись рядом, поэтому иконка для диктора — шум.
    expect(icon.attributes('aria-hidden')).toBe('true')
    expect(icon.classes()).toContain('h-5')
  })

  it('число на бейдже озвучивается словами', () => {
    const wrapper = mountNav({
      items: [{ value: 'home', label: 'Home', badge: 3 }],
    })

    expect(wrapper.get('[data-gr-bottom-nav-badge]').text()).toBe('3')
    expect(wrapper.get('[data-gr-bottom-nav-badge]').attributes('aria-hidden')).toBe('true')
    expect(wrapper.get('[data-gr-bottom-nav-badge-label]').text()).toBe('3 new')
  })

  it('строковый бейдж читается как есть, badgeLabel сильнее обоих', async () => {
    const wrapper = mountNav({
      items: [{ value: 'home', label: 'Home', badge: 'NEW' }],
    })
    expect(wrapper.get('[data-gr-bottom-nav-badge-label]').text()).toBe('NEW')

    await wrapper.setProps({
      items: [{ value: 'home', label: 'Home', badge: 'NEW', badgeLabel: 'новый раздел' }],
    })
    expect(wrapper.get('[data-gr-bottom-nav-badge-label]').text()).toBe('новый раздел')
  })

  it('нулевой бейдж показывается, пустая строка — нет', () => {
    const zero = mountNav({ items: [{ value: 'home', label: 'Home', badge: 0 }] })
    expect(zero.get('[data-gr-bottom-nav-badge]').text()).toBe('0')

    const empty = mountNav({ items: [{ value: 'home', label: 'Home', badge: '' }] })
    expect(empty.find('[data-gr-bottom-nav-badge]').exists()).toBe(false)
  })

  it('disabled не кликается и не остаётся кнопкой', async () => {
    const wrapper = mountNav({
      items: [{ value: 'home', label: 'Home' }, { value: 'profile', label: 'Profile', disabled: true }],
    })
    const disabled = wrapper.findAll('[data-gr-bottom-nav-item]')[1]

    expect(disabled.element.tagName).toBe('SPAN')
    expect(disabled.attributes('aria-disabled')).toBe('true')
    expect(disabled.classes()).toContain('text-[var(--gr-disabled-fg)]')

    await disabled.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('href даёт ссылку, as — свой компонент роутера', () => {
    const withHref = mountNav({
      items: [{ value: 'home', label: 'Home', href: '/home' }],
    })
    const link = withHref.get('[data-gr-bottom-nav-item]')
    expect(link.element.tagName).toBe('A')
    expect(link.attributes('href')).toBe('/home')

    const RouterLink = defineComponent({
      props: { to: { type: String, required: true } },
      setup: (props, { slots }) => () => h('a', { 'data-router-link': props.to }, slots.default?.()),
    })
    const withRouter = mountNav({
      as: RouterLink,
      items: [{ value: 'home', label: 'Home', to: '/home' }],
    })
    expect(withRouter.get('[data-router-link]').attributes('data-router-link')).toBe('/home')
  })

  it('ariaLabel пункта перебивает подпись', () => {
    const wrapper = mountNav({
      items: [{ value: 'home', label: 'Дом', ariaLabel: 'Домашняя страница' }],
    })

    expect(wrapper.get('[data-gr-bottom-nav-item]').attributes('aria-label')).toBe('Домашняя страница')
  })

  it('пункты — обычные остановки Tab, порядок совпадает с items', () => {
    const wrapper = mountNav()
    const stops = wrapper.findAll('[data-gr-bottom-nav-item]')

    // Навигация, а не tablist: roving tabindex здесь был бы лишним слоем, а
    // активацию с клавиатуры `<button>`/`<a>` берут на себя сами.
    expect(stops.map(stop => stop.attributes('tabindex'))).toEqual([undefined, undefined])
    expect(stops.map(stop => stop.text())).toEqual(['Home', 'Profile'])
  })
})

describe('GrBottomNav — видимость и слой', () => {
  it('по умолчанию прячется от sm и сидит на своём слое', () => {
    const root = mountNav().get('nav')

    expect(root.classes()).toContain('sm:hidden')
    expect(root.classes()).toContain('fixed')
    expect(root.classes()).toContain('z-[var(--gr-z-bottom-nav)]')
  })

  it('hideAbove сдвигает брейкпоинт, none оставляет панель видимой всегда', async () => {
    const wrapper = mountNav({ hideAbove: 'lg' })
    expect(wrapper.get('nav').classes()).toContain('lg:hidden')

    await wrapper.setProps({ hideAbove: 'none' })
    const classes = wrapper.get('nav').classes()
    expect(classes.some(name => name.endsWith(':hidden'))).toBe(false)
  })

  it('position=static вынимает панель из фиксированного слоя', () => {
    const root = mountNav({ position: 'static' }).get('nav')

    expect(root.classes()).not.toContain('fixed')
    expect(root.classes()).not.toContain('z-[var(--gr-z-bottom-nav)]')
    expect(root.classes()).toContain('relative')
  })
})
