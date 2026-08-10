import { mount } from '@vue/test-utils'
import { computed, defineComponent, h } from 'vue'
import { describe, expect, it } from 'vitest'

import { GR_CONFIG_KEY } from '../../GrConfigProvider/context'
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

  describe('размер', () => {
    const SIZES = ['xs', 'sm', 'md', 'lg'] as const

    it('ступень тянет высоту полосы, глиф и кегль подписи', () => {
      const rendered = SIZES.map((size) => {
        const wrapper = mountNav({ size, items: [{ value: 'home', label: 'Home', icon: 'i-lucide-home' }] })
        return {
          list: wrapper.get('nav > div').classes().find(name => name.startsWith('h-')),
          icon: wrapper.get('[aria-hidden="true"]').classes().filter(name => name.startsWith('h-') || name.startsWith('w-')).sort().join(' '),
          text: wrapper.get('button').classes().find(name => name.startsWith('text-[length')),
        }
      })

      expect(rendered.map(item => item.list)).toEqual(['h-12', 'h-14', 'h-14', 'h-16'])
      expect(rendered.map(item => item.icon)).toEqual(['h-4 w-4', 'h-5 w-5', 'h-5 w-5', 'h-6 w-6'])
      expect(new Set(rendered.map(item => item.text)).size).toBe(3)
    })

    /**
     * Пол шкалы: тач-таргет не сжимается вместе с полосой. Меньше 44×44 — это
     * WCAG 2.5.5, и ступень `xs` не повод его нарушить.
     */
    it('тач-таргет пункта остаётся 44×44 на каждой ступени', () => {
      for (const size of SIZES) {
        const classes = mountNav({ size }).get('button').classes()

        expect(classes, `ступень ${size}`).toContain('min-h-[44px]')
        expect(classes, `ступень ${size}`).toContain('min-w-[44px]')
      }
    })

    it('размер приезжает из GrConfigProvider, локальный проп сильнее', () => {
      const provide = {
        [GR_CONFIG_KEY as symbol]: {
          size: computed(() => 'lg'),
          componentDefaults: computed(() => ({})),
        },
      }

      const fromProvider = mount(GrBottomNav, {
        props: { modelValue: 'home', items },
        global: { provide },
      })

      expect(fromProvider.get('nav > div').classes()).toContain('h-16')

      const local = mount(GrBottomNav, {
        props: { modelValue: 'home', items, size: 'xs' },
        global: { provide },
      })

      expect(local.get('nav > div').classes()).toContain('h-12')
    })
  })

  describe('слот пункта', () => {
    it('подменяет содержимое, оставляя поведение пункта компоненту', async () => {
      const wrapper = mount(GrBottomNav, {
        props: { modelValue: 'home', items },
        slots: {
          item: '<span data-custom>{{ params.item.label }}:{{ params.active }}</span>',
        },
      })

      const first = wrapper.get('button')

      expect(first.find('[data-custom]').text()).toBe('Home:true')
      // Разметку забрал слот, поведение осталось за компонентом.
      expect(first.attributes('aria-current')).toBe('page')

      await wrapper.findAll('button')[1].trigger('click')
      expect(wrapper.emitted('update:modelValue')).toEqual([['profile']])
    })

    it('отдаёт озвучку счётчика слоту — кастомный пункт не теряет её вместе с разметкой', () => {
      const wrapper = mount(GrBottomNav, {
        props: {
          modelValue: 'home',
          items: [{ value: 'home', label: 'Home', badge: 3 }, { value: 'profile', label: 'Profile' }],
        },
        slots: { item: '<span data-label>{{ params.badgeLabel ?? "—" }}</span>' },
      })

      const labels = wrapper.findAll('[data-label]').map(node => node.text())

      expect(labels).toEqual(['3 new', '—'])
    })
  })
})
