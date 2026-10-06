import { mount, type VueWrapper } from '@vue/test-utils'
import { defineComponent, h, markRaw } from 'vue'
import { describe, expect, it, vi } from 'vitest'

import GrBottomNav from '../components/GrBottomNav/GrBottomNav.vue'
import GrBreadcrumbs from '../components/GrBreadcrumbs/GrBreadcrumbs.vue'
import GrButton from '../components/GrButton/GrButton.vue'
import GrCard from '../components/GrCard/GrCard.vue'
import GrDropdownMenuItem from '../components/GrDropdownMenu/GrDropdownMenuItem.vue'
import GrFilePreview from '../components/GrFilePreview/GrFilePreview.vue'
import GrLink from '../components/GrLink/GrLink.vue'
import GrListItem from '../components/GrList/GrListItem.vue'
import GrSidebarItem from '../components/GrSidebar/GrSidebarItem.vue'
import GrStatistic from '../components/GrStatistic/GrStatistic.vue'
import { definedAttrs } from '../components/shared/polymorphicRoot'

/**
 * Гейт контракта полиморфного корня.
 *
 * `as` называет **тег**, а не поведение: интерактивность даёт то, что попадает
 * в таб-порядок само (`shared/polymorphicRoot.ts`). Правило родилось из одного
 * и того же дефекта, независимо повторённого четырьмя компонентами — каждый
 * выводил интерактивность из самого факта пропа, и `as="section"` получал
 * кольцо фокуса, обещая клавиатуру, которой у него нет.
 *
 * Поэтому проверка сквозная, а не покомпонентная: покомпонентный тест ловит
 * регрессию там, где о правиле уже знают, а пятый компонент с `as` напишут, не
 * заглядывая в соседей.
 *
 * Корень ищется по `data`-атрибуту, а не по `wrapper.element`: у `GrListItem`
 * роль пункта живёт на обёртке, а полиморфна вложенная строка.
 */
const CASES = [
  { name: 'GrCard', component: GrCard, props: {}, root: '[data-gr-card]' },
  { name: 'GrStatistic', component: GrStatistic, props: { value: 1284 }, root: '[data-gr-statistic]' },
  { name: 'GrListItem', component: GrListItem, props: { title: 'Row' }, root: '[data-gr-list-item] > *' },
  {
    name: 'GrFilePreview',
    component: GrFilePreview,
    props: { mime: 'application/pdf', name: 'счёт.pdf' },
    root: '[data-gr-file-preview]',
  },
] as const

const FOCUS_RING = 'focus-visible:ring-2'

describe('контракт полиморфного корня: as называет тег, а не поведение', () => {
  it.each(CASES)('$name: неинтерактивный as не включает кольцо фокуса', ({ component, props, root }) => {
    const wrapper = mount(component, { props: { ...props, as: 'section' } })
    const element = wrapper.get(root)

    expect(element.element.tagName).toBe('SECTION')
    expect(element.classes()).not.toContain(FOCUS_RING)
  })

  it.each(CASES)('$name: классы неинтерактивного as равны классам дефолтного корня', ({ component, props, root }) => {
    const plain = mount(component, { props })
    const semantic = mount(component, { props: { ...props, as: 'section' } })

    expect(semantic.get(root).attributes('class')).toBe(plain.get(root).attributes('class'))
  })

  // `<a>` без ссылки не фокусируется и роли ссылки не имеет: одного тега мало.
  it.each(CASES)('$name: as="a" без href не интерактивен', ({ component, props, root }) => {
    const wrapper = mount(component, { props: { ...props, as: 'a' } })

    expect(wrapper.get(root).classes()).not.toContain(FOCUS_RING)
  })

  it.each(CASES)('$name: as="button" интерактивен и без clickable', ({ component, props, root }) => {
    const wrapper = mount(component, { props: { ...props, as: 'button' } })

    expect(wrapper.get(root).classes()).toContain(FOCUS_RING)
  })

  /**
   * Зеркальная ловушка: потребитель попросил действие на теге вне таб-порядка.
   * Клик остаётся — гасить его молча значило бы сломать работающий код, — но
   * об ошибке говорят вслух.
   */
  it.each(CASES)('$name: clickable с неинтерактивным as предупреждает', ({ component, props }) => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    mount(component, { props: { ...props, as: 'section', clickable: true } })

    expect(warn.mock.calls.flat().join(' ')).toContain('таб-порядок')

    warn.mockRestore()
  })
})

/**
 * Компонент-ссылка из `as` (`RouterLink`, `NuxtLink`, `Link` от Inertia) сам
 * вычисляет `href` своему `<a>`. Всё, что корень привязал со значением
 * `undefined`, доезжает до него в `$attrs` и при fallthrough ложится поверх:
 * `href: undefined` оставлял ссылку без адреса — вне порядка Tab, без «открыть
 * в новой вкладке».
 *
 * Заглушка устроена как `RouterLink`: `to` — проп, `href` — её собственный.
 */
const RouterLinkStub = markRaw(defineComponent({
  name: 'RouterLinkStub',
  props: { to: { type: String, required: true } },
  setup: (props, { slots }) => () => h('a', { href: `#${props.to}` }, slots.default?.()),
}))

const TO = '/reports'
const asLink = { as: RouterLinkStub }

const LINK_CASES: { name: string, render: () => VueWrapper }[] = [
  { name: 'GrButton', render: () => mount(GrButton, { props: asLink, attrs: { to: TO }, slots: { default: 'Отчёты' } }) },
  { name: 'GrLink', render: () => mount(GrLink, { props: asLink, attrs: { to: TO }, slots: { default: 'Отчёты' } }) },
  { name: 'GrCard', render: () => mount(GrCard, { props: asLink, attrs: { to: TO }, slots: { default: 'Отчёты' } }) },
  { name: 'GrStatistic', render: () => mount(GrStatistic, { props: { ...asLink, value: 1284 }, attrs: { to: TO } }) },
  {
    name: 'GrFilePreview',
    render: () => mount(GrFilePreview, {
      props: { ...asLink, mime: 'application/pdf', name: 'счёт.pdf' },
      attrs: { to: TO },
    }),
  },
  { name: 'GrListItem', render: () => mount(GrListItem, { props: { ...asLink, title: 'Отчёты', to: TO } }) },
  { name: 'GrSidebarItem', render: () => mount(GrSidebarItem, { props: { ...asLink, label: 'Отчёты' }, attrs: { to: TO } }) },
  {
    name: 'GrDropdownMenuItem',
    render: () => mount(GrDropdownMenuItem, { props: asLink, attrs: { to: TO }, slots: { default: 'Отчёты' } }),
  },
  {
    name: 'GrBottomNav',
    render: () => mount(GrBottomNav, {
      props: { ...asLink, modelValue: 'home', items: [{ value: 'reports', label: 'Отчёты', to: TO }] },
    }),
  },
  {
    name: 'GrBreadcrumbs',
    render: () => mount(GrBreadcrumbs, {
      props: { ...asLink, items: [{ label: 'Отчёты', to: TO }, { label: 'Квартал' }] },
    }),
  },
]

describe('компонент-ссылка из as сохраняет свой href', () => {
  it.each(LINK_CASES)('$name: href ставит сама ссылка, type к ней не приходит', ({ render }) => {
    const link = render().get('a')

    expect(link.attributes('href')).toBe(`#${TO}`)
    expect(link.attributes('type')).toBeUndefined()
  })

  // Обратная сторона: выключенная ссылка адреса не получает и от компонента —
  // с ним средняя кнопка обошла бы любой перехват клика.
  it('выключенные GrButton и GrDropdownMenuItem остаются без адреса', () => {
    const button = mount(GrButton, { props: { ...asLink, disabled: true }, attrs: { to: TO } })
    const item = mount(GrDropdownMenuItem, { props: { ...asLink, disabled: true }, attrs: { to: TO } })

    expect(button.get('a').attributes('href')).toBeUndefined()
    expect(item.get('a').attributes('href')).toBeUndefined()
  })

  it('definedAttrs выбрасывает только undefined', () => {
    expect(definedAttrs({ 'href': undefined, 'type': 'button', 'aria-label': '', 'rel': null }))
      .toEqual({ 'type': 'button', 'aria-label': '', 'rel': null })
  })
})
