import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'

import GrBreadcrumbs from '../GrBreadcrumbs.vue'
import GrConfigProvider from '../../GrConfigProvider/GrConfigProvider.vue'
import { resolveBreadcrumbsFit, resolveBreadcrumbsLayout } from '../grBreadcrumbsStyles'

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

  describe('раскладка по доступной ширине', () => {
    // Пять пунктов по 100px, разделитель 10px, кнопка «…» 20px.
    const WIDTHS = [100, 100, 100, 100, 100]
    const fit = (available: number) => resolveBreadcrumbsFit({
      itemWidths: WIDTHS,
      separatorWidth: 10,
      ellipsisWidth: 20,
      available,
      itemsBeforeCollapse: 1,
    })

    it('влезло всё — не схлопываем', () => {
      // 5×100 + 4×10 = 540
      expect(fit(540)).toBe(5)
      expect(fit(1000)).toBe(5)
    })

    it('не влезло — ужимается хвост, а не голова', () => {
      // голова 100 + «…» 20 + хвост 3×100 + 4 разделителя = 460
      expect(fit(539)).toBe(3)
      expect(fit(460)).toBe(3)
      // 100 + 20 + 2×100 + 3×10 = 350
      expect(fit(459)).toBe(2)
    })

    it('хвост не ужимается ниже одного пункта: он отвечает «где я сейчас»', () => {
      expect(fit(0)).toBe(1)
      expect(fit(10)).toBe(1)
    })

    it('пустой путь схлопывать нечего', () => {
      expect(resolveBreadcrumbsFit({
        itemWidths: [],
        separatorWidth: 10,
        ellipsisWidth: 20,
        available: 100,
        itemsBeforeCollapse: 1,
      })).toBe(0)
    })
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

/**
 * Схлопывание по ширине в jsdom: layout там не считается, поэтому размеры
 * подменяются. Приём тот же, что в тесте аддонов `GrInput`, — свои
 * `scrollWidth`/`clientWidth` вместо нулей jsdom.
 */
describe('GrBreadcrumbs — схлопывание по ширине', () => {
  const LONG = Array.from({ length: 5 }, (_, i) => ({ label: `Уровень ${i + 1}`, href: `/l${i + 1}` }))

  const ITEM_WIDTH = 100
  const SEPARATOR_WIDTH = 10
  const ELLIPSIS_WIDTH = 20

  let available = 1000
  const original = {
    scrollWidth: Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollWidth'),
    clientWidth: Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientWidth'),
  }

  function stubLayout(width: number): void {
    available = width

    Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
      configurable: true,
      get(this: HTMLElement) {
        if (this.matches('[data-gr-breadcrumbs-item-wrap]')) return ITEM_WIDTH
        if (this.matches('[data-gr-breadcrumbs-separator]')) return SEPARATOR_WIDTH
        if (this.matches('[data-gr-breadcrumbs-ellipsis-item]')) return ELLIPSIS_WIDTH
        return 0
      },
    })

    Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
      configurable: true,
      get(this: HTMLElement) {
        return this.matches('[data-gr-breadcrumbs-list]') ? available : 0
      },
    })
  }

  afterEach(() => {
    for (const [name, descriptor] of Object.entries(original)) {
      if (descriptor) Object.defineProperty(HTMLElement.prototype, name, descriptor)
      else delete (HTMLElement.prototype as unknown as Record<string, unknown>)[name]
    }
  })

  async function mountAuto(width: number) {
    stubLayout(width)
    const wrapper = mount(GrBreadcrumbs, {
      props: { items: LONG, autoCollapse: true },
      attachTo: document.body,
    })

    // Кадр на замер, кадр на схлопывание, кадр на уточнение ширины кнопки «…».
    await nextTick()
    await nextTick()
    await nextTick()
    await nextTick()

    return wrapper
  }

  it('широкий контейнер оставляет путь целиком', async () => {
    // 5×100 + 4×10 = 540
    const wrapper = await mountAuto(600)

    expect(wrapper.findAll('[data-gr-breadcrumbs-item]')).toHaveLength(5)
    expect(wrapper.find('[data-testid="gr-breadcrumbs-ellipsis"]').exists()).toBe(false)

    wrapper.unmount()
  })

  it('узкий контейнер прячет середину', async () => {
    const wrapper = await mountAuto(300)

    expect(wrapper.find('[data-testid="gr-breadcrumbs-ellipsis"]').exists()).toBe(true)
    expect(wrapper.findAll('[data-gr-breadcrumbs-item]').length).toBeLessThan(5)

    wrapper.unmount()
  })

  it('в самом узком контейнере остаётся текущая страница', async () => {
    const wrapper = await mountAuto(10)
    const items = wrapper.findAll('[data-gr-breadcrumbs-item]')

    // Голова, «…» и текущая страница: путь не схлопывается в ничто.
    expect(items).toHaveLength(2)
    expect(items[items.length - 1].text()).toContain('Уровень 5')

    wrapper.unmount()
  })

  it('однострочный режим включается только вместе с пропом', async () => {
    const auto = await mountAuto(600)
    expect(auto.get('[data-gr-breadcrumbs-list]').classes()).toContain('flex-nowrap')
    auto.unmount()

    const plain = mount(GrBreadcrumbs, { props: { items: LONG }, attachTo: document.body })
    expect(plain.get('[data-gr-breadcrumbs-list]').classes()).toContain('flex-wrap')
    plain.unmount()
  })

  it('раскрытие возвращает перенос: путь не обрезается вместе с текущей страницей', async () => {
    const wrapper = await mountAuto(300)
    const list = wrapper.get('[data-gr-breadcrumbs-list]')

    expect(list.classes()).toContain('flex-nowrap')

    await wrapper.get('[data-testid="gr-breadcrumbs-ellipsis"]').trigger('click')
    await nextTick()

    // Одна строка раскрытый путь не вмещает — её нехватка и вызвала схлопывание,
    // а `overflow: hidden` срезал бы хвост.
    expect(list.classes()).toContain('flex-wrap')
    expect(list.classes()).not.toContain('overflow-hidden')

    const items = wrapper.findAll('[data-gr-breadcrumbs-item]')
    expect(items).toHaveLength(5)
    expect(items[items.length - 1].text()).toContain('Уровень 5')

    wrapper.unmount()
  })

  it('новый путь снова схлопывается и возвращает однострочный режим', async () => {
    const wrapper = await mountAuto(300)
    await wrapper.get('[data-testid="gr-breadcrumbs-ellipsis"]').trigger('click')
    await nextTick()

    await wrapper.setProps({ items: LONG.map(item => ({ ...item, label: `${item.label} v2` })) })
    await nextTick()
    await nextTick()
    await nextTick()

    expect(wrapper.get('[data-gr-breadcrumbs-list]').classes()).toContain('flex-nowrap')
    expect(wrapper.find('[data-testid="gr-breadcrumbs-ellipsis"]').exists()).toBe(true)

    wrapper.unmount()
  })

  it('зазор списка входит в расчёт: с ним влезает меньше пунктов', () => {
    const widths = Array.from({ length: 5 }).fill(ITEM_WIDTH) as number[]
    const common = {
      itemWidths: widths,
      separatorWidth: SEPARATOR_WIDTH,
      ellipsisWidth: ELLIPSIS_WIDTH,
      available: 560,
      itemsBeforeCollapse: 1,
    }

    // 5×100 + 4×10 = 540 ≤ 560 — без зазоров путь «влезает».
    expect(resolveBreadcrumbsFit(common)).toBe(5)
    // С gap 4px добавляется 8 зазоров = 32px: 572 > 560, и путь обязан схлопнуться.
    expect(resolveBreadcrumbsFit({ ...common, gapWidth: 4 })).toBeLessThan(5)
  })
})
