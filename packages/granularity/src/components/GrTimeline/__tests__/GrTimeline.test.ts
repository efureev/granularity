import { mount } from '@vue/test-utils'
import { h } from 'vue'
import { describe, expect, it } from 'vitest'

import GrConfigProvider from '../../GrConfigProvider/GrConfigProvider.vue'
import GrTimeline from '../GrTimeline.vue'
import GrTimelineItem from '../GrTimelineItem.vue'

interface Event {
  id: number
  at: string
  title: string
  day?: string
}

const events: Event[] = [
  { id: 1, at: '10:24', title: 'Заказ создан', day: '12 августа' },
  { id: 2, at: '11:03', title: 'Оплачен', day: '12 августа' },
  { id: 3, at: '18:20', title: 'Черновик', day: '11 августа' },
]

function mountData(props: Record<string, unknown> = {}) {
  return mount(GrTimeline, {
    props: { items: events, itemKey: 'id', ...props },
    slots: {
      item: ({ item }: { item: unknown }) => {
        const event = item as Event
        return h(GrTimelineItem, { time: event.at, title: event.title })
      },
    },
  })
}

describe('GrTimeline', () => {
  it('оба режима подачи дают одинаковую разметку пунктов', () => {
    const data = mountData()
    const manual = mount(GrTimeline, {
      slots: {
        default: () => events.map(event => h(GrTimelineItem, { time: event.at, title: event.title })),
      },
    })

    const titles = (wrapper: typeof data) => wrapper
      .findAll('[data-gr-timeline-title]')
      .map(node => node.text())

    expect(titles(data)).toEqual(['Заказ создан', 'Оплачен', 'Черновик'])
    expect(titles(manual)).toEqual(titles(data))
    // Пункт — элемент списка: лента упорядочена по времени.
    expect(data.findAll('ol[data-gr-timeline-list] > li')).toHaveLength(3)
  })

  it('`itemKey` берётся полем и функцией', () => {
    const byField = mountData()
    const byFunction = mountData({ itemKey: (item: Event) => `e-${item.id}` })

    expect(byField.findAll('[data-gr-timeline-item]')).toHaveLength(3)
    expect(byFunction.findAll('[data-gr-timeline-item]')).toHaveLength(3)
  })

  it('группировка раскладывает события по секциям с заголовками', () => {
    const wrapper = mountData({ groupBy: 'day' })

    const sections = wrapper.findAll('[data-gr-timeline-group]')
    expect(sections).toHaveLength(2)
    expect(sections.map(section => section.get('[data-gr-timeline-group-title]').text()))
      .toEqual(['12 августа', '11 августа'])
    // Порядок внутри группы — исходный.
    expect(sections[0].findAll('[data-gr-timeline-title]').map(node => node.text()))
      .toEqual(['Заказ создан', 'Оплачен'])
  })

  it('уровень заголовка группы задаётся пропом', () => {
    const wrapper = mountData({ groupBy: 'day' })
    expect(wrapper.get('[data-gr-timeline-group-title]').element.tagName).toBe('H3')

    const deeper = mountData({ groupBy: 'day', groupHeadingLevel: 5 })
    expect(deeper.get('[data-gr-timeline-group-title]').element.tagName).toBe('H5')
  })

  it('слот `#group` перебивает ключ и получает состав группы', () => {
    const wrapper = mount(GrTimeline, {
      props: { items: events, itemKey: 'id', groupBy: 'day' },
      slots: {
        item: ({ item }: { item: unknown }) => h(GrTimelineItem, { title: (item as Event).title }),
        group: ({ group, items }: { group: string, items: unknown[] }) => `${group} · ${items.length}`,
      },
    })

    expect(wrapper.findAll('[data-gr-timeline-group-title]').map(node => node.text()))
      .toEqual(['12 августа · 2', '11 августа · 1'])
  })

  it('раскладка и ориентация доезжают до разметки', () => {
    expect(mountData().get('[data-gr-timeline]').attributes('data-layout')).toBe('stacked')
    expect(mountData({ layout: 'time' }).get('[data-gr-timeline]').attributes('data-layout')).toBe('time')

    const horizontal = mountData({ orientation: 'horizontal' })
    expect(horizontal.get('[data-gr-timeline]').attributes('data-orientation')).toBe('horizontal')
    // Скроллящийся блок обязан быть достижим с клавиатуры.
    expect(horizontal.get('[data-gr-timeline-list]').attributes('tabindex')).toBe('0')
  })

  it('в горизонтальной ленте вертикальная раскладка не применяется', () => {
    // Колонка времени и чередование сторон — вертикальные приёмы.
    const wrapper = mountData({ orientation: 'horizontal', layout: 'time' })

    expect(wrapper.get('[data-gr-timeline]').attributes('data-layout')).toBe('stacked')
    expect(wrapper.find('[data-gr-timeline-aside]').exists()).toBe(false)
  })

  it('`layout="time"` уводит метку в свою колонку', () => {
    const wrapper = mountData({ layout: 'time' })

    expect(wrapper.get('[data-gr-timeline-aside]').text()).toBe('10:24')
    expect(wrapper.find('[data-gr-timeline-time]').exists()).toBe(false)
  })

  it('пустая лента показывает текст из локали, `emptyText` и слот', () => {
    expect(mountData({ items: [] }).get('[data-gr-timeline-empty]').text())
      .toBe('Nothing here yet')

    expect(mountData({ items: [], emptyText: 'Событий нет' }).get('[data-gr-timeline-empty]').text())
      .toBe('Событий нет')

    const withSlot = mount(GrTimeline, {
      props: { items: [] },
      slots: { empty: () => 'Ничего не происходило' },
    })
    expect(withSlot.get('[data-gr-timeline-empty]').text()).toBe('Ничего не происходило')
  })

  it('пустой слот по умолчанию тоже считается пустой лентой', () => {
    const wrapper = mount(GrTimeline, { slots: { default: () => [] } })

    expect(wrapper.find('[data-gr-timeline-empty]').exists()).toBe(true)
  })

  it('загрузка показывает заглушки и помечает контейнер', () => {
    const wrapper = mountData({ loading: true, loadingRows: 2 })

    expect(wrapper.findAll('[data-gr-timeline-loading-row]')).toHaveLength(2)
    expect(wrapper.get('[data-gr-timeline]').attributes('aria-busy')).toBe('true')
    expect(wrapper.find('[data-gr-timeline-item]').exists()).toBe(false)
  })

  it('плотность приходит из `GrConfigProvider`, локальный проп сильнее', () => {
    const fromConfig = mount(GrConfigProvider, {
      props: { componentDefaults: { GrTimeline: { density: 'compact' } } },
      slots: {
        default: () => h(GrTimeline, null, {
          default: () => h(GrTimelineItem, { title: 'A' }),
        }),
      },
    })
    expect(fromConfig.get('[data-gr-timeline-content]').classes()).toContain('pb-3')

    const localWins = mount(GrConfigProvider, {
      props: { componentDefaults: { GrTimeline: { density: 'compact' } } },
      slots: {
        default: () => h(GrTimeline, { density: 'regular' }, {
          default: () => h(GrTimelineItem, { title: 'A' }),
        }),
      },
    })
    expect(localWins.get('[data-gr-timeline-content]').classes()).toContain('pb-5')
  })
})

describe('GrTimelineItem', () => {
  function mountItem(props: Record<string, unknown> = {}, slots = {}) {
    return mount(GrTimeline, {
      slots: { default: () => h(GrTimelineItem, props, slots) },
    })
  }

  it('маркер красится тоном и вариантом', () => {
    expect(mountItem({ tone: 'success' }).get('[data-gr-timeline-marker]').classes())
      .toContain('bg-[var(--gr-success)]')

    const outlined = mountItem({ tone: 'success', variant: 'outlined' })
    expect(outlined.get('[data-gr-timeline-marker]').classes())
      .toEqual(expect.arrayContaining(['bg-[var(--gr-bg)]', 'border-[var(--gr-success)]']))
  })

  it('`pending` делает точку полой и помечает пункт', () => {
    // Пунктир на отрезке после точки рисует CSS по этому атрибуту.
    const wrapper = mountItem({ tone: 'info', variant: 'filled', pending: true })

    expect(wrapper.get('[data-gr-timeline-item]').attributes('data-pending')).toBe('')
    expect(wrapper.get('[data-gr-timeline-marker]').classes())
      .toContain('border-[var(--gr-info)]')
  })

  it('слот `#marker` заменяет точку', () => {
    const wrapper = mountItem({}, { marker: () => h('i', { class: 'i-lucide-check' }) })

    expect(wrapper.find('[data-gr-timeline-marker]').exists()).toBe(false)
    expect(wrapper.find('i.i-lucide-check').exists()).toBe(true)
  })

  it('ось и маркер скрыты от диктора: смысл несёт текст', () => {
    const wrapper = mountItem({ title: 'A' })

    expect(wrapper.get('[data-gr-timeline-rail]').attributes('aria-hidden')).toBe('true')
  })

  it('метка времени машиночитаема только с `datetime`', () => {
    const withDatetime = mountItem({ time: '10:24', datetime: '2026-08-12T10:24' })
    expect(withDatetime.get('[data-gr-timeline-time]').element.tagName).toBe('TIME')
    expect(withDatetime.get('[data-gr-timeline-time]').attributes('datetime'))
      .toBe('2026-08-12T10:24')

    expect(mountItem({ time: '10:24' }).get('[data-gr-timeline-time]').attributes('datetime'))
      .toBeUndefined()
  })

  it('слоты сильнее одноимённых пропов', () => {
    const wrapper = mountItem(
      { time: '10:24', title: 'Проп', description: 'Проп' },
      { title: () => 'Слот', description: () => 'Слот' },
    )

    expect(wrapper.get('[data-gr-timeline-title]').text()).toBe('Слот')
    expect(wrapper.text()).not.toContain('Проп')
  })

  it('пункт вне ленты остаётся рабочей строкой', () => {
    // Контекста нет — берутся дефолты, а не падение.
    const wrapper = mount(GrTimelineItem, { props: { title: 'A' } })

    expect(wrapper.get('[data-gr-timeline-content]').classes()).toContain('pb-5')
  })
})
