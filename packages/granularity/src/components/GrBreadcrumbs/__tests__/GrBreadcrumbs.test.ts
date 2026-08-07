import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue'
import { describe, expect, it } from 'vitest'

import GrBreadcrumbs from '../GrBreadcrumbs.vue'
import GrConfigProvider from '../../GrConfigProvider/GrConfigProvider.vue'
import { resolveBreadcrumbsLayout } from '../grBreadcrumbsStyles'

const PATH = [
  { label: 'Главная', href: '/' },
  { label: 'Проекты', href: '/projects' },
  { label: 'Гранулярность', href: '/projects/granularity' },
  { label: 'Настройки' },
]

function mountPath(props: Record<string, unknown> = {}) {
  return mount(GrBreadcrumbs, { props: { items: PATH, ...props }, attachTo: document.body })
}

describe('GrBreadcrumbs — структура и семантика', () => {
  it('рендерит лендмарк с именем и упорядоченный список', () => {
    const wrapper = mountPath()

    const nav = wrapper.get('nav')
    expect(nav.attributes('aria-label')).toBe('Breadcrumb')
    expect(nav.find('ol').exists()).toBe(true)
    expect(wrapper.findAll('[data-gr-breadcrumbs-item]')).toHaveLength(4)

    wrapper.unmount()
  })

  it('имя лендмарка переопределяется пропом', () => {
    const wrapper = mountPath({ ariaLabel: 'Путь по разделам' })
    expect(wrapper.get('nav').attributes('aria-label')).toBe('Путь по разделам')
    wrapper.unmount()
  })

  it('последний пункт — текущая страница: не ссылка и объявлен `aria-current`', () => {
    const wrapper = mountPath()
    const items = wrapper.findAll('[data-gr-breadcrumbs-item]')

    expect(items.at(-1)!.element.tagName).toBe('SPAN')
    expect(items.at(-1)!.attributes('aria-current')).toBe('page')
    // На промежуточных `aria-current` быть не должно — иначе «где я» теряет смысл.
    expect(items.slice(0, -1).every(i => i.attributes('aria-current') === undefined)).toBe(true)
    expect(items[0].element.tagName).toBe('A')

    wrapper.unmount()
  })

  it('`linkCurrent` оставляет текущую страницу ссылкой, сохраняя `aria-current`', () => {
    const wrapper = mountPath({
      items: [...PATH.slice(0, 3), { label: 'Настройки', href: '/projects/granularity/settings' }],
      linkCurrent: true,
    })
    const last = wrapper.findAll('[data-gr-breadcrumbs-item]').at(-1)!

    expect(last.element.tagName).toBe('A')
    expect(last.attributes('aria-current')).toBe('page')

    wrapper.unmount()
  })

  it('разделители скрыты от диктора: структуру сообщает список', () => {
    const wrapper = mountPath()
    const separators = wrapper.findAll('[data-gr-breadcrumbs-separator]')

    expect(separators).toHaveLength(3)
    expect(separators.every(s => s.attributes('aria-hidden') === 'true')).toBe(true)
    expect(separators[0].text()).toBe('/')

    wrapper.unmount()
  })

  it('выключенный пункт не становится ссылкой', () => {
    const wrapper = mountPath({
      items: [{ label: 'Архив', href: '/archive', disabled: true }, { label: 'Документ' }],
    })
    const first = wrapper.findAll('[data-gr-breadcrumbs-item]')[0]

    expect(first.element.tagName).toBe('SPAN')
    expect(first.attributes('aria-disabled')).toBe('true')

    wrapper.unmount()
  })

  it('иконка пункта декоративна', () => {
    const wrapper = mountPath({ items: [{ label: 'Главная', href: '/', icon: 'i-lucide-house' }, { label: 'Тут' }] })
    const icon = wrapper.get('.i-lucide-house')

    expect(icon.attributes('aria-hidden')).toBe('true')

    wrapper.unmount()
  })
})

describe('GrBreadcrumbs — схлопывание', () => {
  const LONG = Array.from({ length: 6 }, (_, i) => ({ label: `Уровень ${i + 1}`, href: `/l${i + 1}` }))

  it('раскладка: середина сворачивается, голова и хвост остаются', () => {
    const entries = resolveBreadcrumbsLayout({
      items: LONG,
      maxItems: 4,
      itemsBeforeCollapse: 1,
      itemsAfterCollapse: 2,
      expanded: false,
    })

    expect(entries.map(e => (e.kind === 'item' ? e.index : 'ellipsis'))).toEqual([0, 'ellipsis', 4, 5])
    expect(entries.find(e => e.kind === 'ellipsis')).toMatchObject({ hiddenCount: 3 })
  })

  it('раскладка: путь короче предела не сворачивается', () => {
    const entries = resolveBreadcrumbsLayout({
      items: LONG.slice(0, 3),
      maxItems: 4,
      itemsBeforeCollapse: 1,
      itemsAfterCollapse: 1,
      expanded: false,
    })

    expect(entries.every(e => e.kind === 'item')).toBe(true)
  })

  it('раскладка: прятать один пункт незачем — кнопка заняла бы столько же места', () => {
    const entries = resolveBreadcrumbsLayout({
      items: LONG.slice(0, 3),
      maxItems: 2,
      itemsBeforeCollapse: 1,
      itemsAfterCollapse: 1,
      expanded: false,
    })

    expect(entries).toHaveLength(3)
    expect(entries.every(e => e.kind === 'item')).toBe(true)
  })

  it('кнопка «…» раскрывает путь и уводит фокус на первый раскрытый пункт', async () => {
    const wrapper = mount(GrBreadcrumbs, {
      props: { items: LONG, maxItems: 3, itemsBeforeCollapse: 1, itemsAfterCollapse: 1 },
      attachTo: document.body,
    })

    expect(wrapper.findAll('[data-gr-breadcrumbs-item]')).toHaveLength(2)
    const button = wrapper.get('[data-testid="gr-breadcrumbs-ellipsis"]')
    expect(button.attributes('aria-label')).toBe('Show hidden path')

    await button.trigger('click')
    await nextTick()

    const items = wrapper.findAll('[data-gr-breadcrumbs-item]')
    expect(items).toHaveLength(6)
    expect(wrapper.find('[data-testid="gr-breadcrumbs-ellipsis"]').exists()).toBe(false)
    // Кнопка исчезла вместе со схлопыванием — фокус обязан остаться в пути.
    expect(document.activeElement).toBe(items[1].element)

    wrapper.unmount()
  })

  it('новый путь снова схлопывается', async () => {
    const wrapper = mount(GrBreadcrumbs, {
      props: { items: LONG, maxItems: 3 },
      attachTo: document.body,
    })
    await wrapper.get('[data-testid="gr-breadcrumbs-ellipsis"]').trigger('click')
    await nextTick()
    expect(wrapper.find('[data-testid="gr-breadcrumbs-ellipsis"]').exists()).toBe(false)

    await wrapper.setProps({ items: [...LONG].reverse() })
    await nextTick()

    expect(wrapper.find('[data-testid="gr-breadcrumbs-ellipsis"]').exists()).toBe(true)

    wrapper.unmount()
  })
})

describe('GrBreadcrumbs — интеграция', () => {
  it('пробрасывает `as` и `to` в компонент роутера', () => {
    // `to` доезжает до роутерной ссылки пропом — через `attrs` `GrLink`.
    const RouterLinkStub = defineComponent({
      name: 'RouterLinkStub',
      props: { to: { type: String, default: 'НЕТ' } },
      setup: (props, { slots }) => () => h('a', { 'data-to': props.to, 'data-router-link': '' }, slots.default?.()),
    })

    const wrapper = mount(GrBreadcrumbs, {
      props: {
        as: RouterLinkStub,
        items: [{ label: 'Главная', to: '/' }, { label: 'Тут' }],
      },
    })

    const link = wrapper.get('[data-router-link]')
    expect(link.attributes('data-to')).toBe('/')
    expect(link.text()).toContain('Главная')
  })

  it('размер приходит из `GrConfigProvider`, локальный проп сильнее', () => {
    const Harness = defineComponent({
      components: { GrBreadcrumbs, GrConfigProvider },
      props: { size: { type: String, default: undefined } },
      setup: () => ({ items: PATH }),
      template: `
        <GrConfigProvider size="lg">
          <GrBreadcrumbs :items="items" :size="size" />
        </GrConfigProvider>
      `,
    })

    const fromProvider = mount(Harness)
    expect(fromProvider.get('nav').classes()).toContain('text-[length:var(--gr-text-base)]')

    const local = mount(Harness, { props: { size: 'xs' } })
    expect(local.get('nav').classes()).toContain('text-[length:var(--gr-text-xs)]')
  })

  it('разделитель настраивается пропом и через провайдер', () => {
    const local = mountPath({ separator: '›' })
    expect(local.get('[data-gr-breadcrumbs-separator]').text()).toBe('›')
    local.unmount()

    const Harness = defineComponent({
      components: { GrBreadcrumbs, GrConfigProvider },
      setup: () => ({ items: PATH }),
      template: `
        <GrConfigProvider :component-defaults="{ GrBreadcrumbs: { separator: '→' } }">
          <GrBreadcrumbs :items="items" />
        </GrConfigProvider>
      `,
    })
    const fromProvider = mount(Harness)
    expect(fromProvider.get('[data-gr-breadcrumbs-separator]').text()).toBe('→')
  })

  it('слоты подменяют содержимое пункта и разделитель', () => {
    const wrapper = mount(GrBreadcrumbs, {
      props: { items: PATH },
      slots: {
        item: '<template #item="{ item, isCurrent }"><b :data-current="isCurrent">{{ item.label }}</b></template>',
        separator: '<span data-custom-separator>»</span>',
      },
    })

    expect(wrapper.findAll('b')).toHaveLength(4)
    expect(wrapper.findAll('[data-custom-separator]')).toHaveLength(3)
    expect(wrapper.findAll('b').at(-1)!.attributes('data-current')).toBe('true')
  })
})
