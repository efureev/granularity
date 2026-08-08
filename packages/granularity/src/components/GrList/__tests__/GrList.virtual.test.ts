import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'

import GrList, { GrListItem } from '..'

/**
 * Data-режим и виртуализация.
 *
 * jsdom не считает layout: высота контейнера и пунктов там нулевая, поэтому окно
 * считается от объявленного `maxHeight` и оценки пункта. Геометрию после
 * настоящего замера проверяет спек композабла (`useVirtualList.test.ts`), здесь —
 * контракт списка: что попадает в DOM, что говорит ARIA про набор и на чём
 * ловится забытый проброс `aria`.
 */

const TOTAL = 2000

type Item = { id: number, name: string }

function manyItems(count = TOTAL): Item[] {
  return Array.from({ length: count }, (_, index) => ({ id: index + 1, name: `Item ${index + 1}` }))
}

const itemSlot = `<GrListItem v-bind="aria" :title="item.name" />`

function mountList(props: Record<string, unknown> = {}, slot = itemSlot) {
  return mount(GrList, {
    props: { items: manyItems(), itemKey: 'id', ...props },
    slots: { item: slot },
    global: { components: { GrListItem } },
    attachTo: document.body,
  })
}

function items(wrapper: ReturnType<typeof mountList>) {
  return wrapper.findAll('[role="listitem"]')
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('GrList — data-режим', () => {
  it('рисует набор через слот `#item`', () => {
    const wrapper = mountList({ items: manyItems(3) })

    expect(items(wrapper)).toHaveLength(3)
    expect(wrapper.text()).toContain('Item 2')
    wrapper.unmount()
  })

  it('пустой набор уходит в ветку пустоты, а не в пустой список', () => {
    const wrapper = mountList({ items: [] })

    expect(items(wrapper)).toHaveLength(0)
    expect(wrapper.find('[data-gr-list-empty]').exists()).toBe(true)
    wrapper.unmount()
  })

  it('`maxHeight` делает контейнер скроллером, достижимым с клавиатуры', () => {
    const wrapper = mountList({ items: manyItems(3), maxHeight: 240 })
    const list = wrapper.get('[data-gr-list]')

    // Скроллящийся блок без `tabindex` недостижим для тех, кто без мыши.
    expect(list.attributes('tabindex')).toBe('0')
    expect(list.attributes('style')).toContain('max-height: 240px')
    wrapper.unmount()
  })

  it('без `maxHeight` контейнер остаётся прежним', () => {
    const wrapper = mountList({ items: manyItems(3) })
    const list = wrapper.get('[data-gr-list]')

    expect(list.attributes('tabindex')).toBeUndefined()
    expect(list.attributes('style')).toBeUndefined()
    wrapper.unmount()
  })

  it('прежний режим со слотом по умолчанию цел', () => {
    const wrapper = mount(GrList, {
      slots: { default: '<GrListItem title="Один" />' },
      global: { components: { GrListItem } },
    })

    expect(items(wrapper)).toHaveLength(1)
    expect(wrapper.get('[data-gr-list]').attributes('data-gr-virtual')).toBeUndefined()
    wrapper.unmount()
  })
})

describe('GrList — виртуализация', () => {
  it('без пропа рендерит весь набор и распорок не заводит', () => {
    const wrapper = mountList({ items: manyItems(120), maxHeight: 400 })

    expect(items(wrapper)).toHaveLength(120)
    expect(wrapper.get('[data-gr-list]').attributes('data-gr-virtual')).toBeUndefined()
    wrapper.unmount()
  })

  it('с `virtual` держит в DOM окно, а не весь набор', () => {
    const wrapper = mountList({ virtual: true, maxHeight: 400 })

    const rendered = items(wrapper).length
    expect(rendered).toBeGreaterThan(0)
    expect(rendered).toBeLessThan(50)
    expect(wrapper.get('[data-gr-list]').attributes('data-gr-virtual')).toBe('')
    wrapper.unmount()
  })

  it('срезанное держат распорки на псевдоэлементах контейнера', () => {
    const wrapper = mountList({ virtual: true, maxHeight: 400 })
    const style = wrapper.get('[data-gr-list]').attributes('style') ?? ''

    expect(style).toContain('--gr-virtual-after')
    // Якорь удерживает видимый узел, подправляя `scrollTop` при изменении высоты
    // содержимого выше него, — а окно меняет её на каждом кадре прокрутки.
    expect(style).toContain('overflow-anchor: none')
    wrapper.unmount()
  })

  it('прокрутка сдвигает окно', async () => {
    const wrapper = mountList({ virtual: true, maxHeight: 400 })
    const box = wrapper.get('[data-gr-list]').element as HTMLElement

    const before = items(wrapper)[0].text()

    box.scrollTop = 8000
    box.dispatchEvent(new Event('scroll'))
    await nextTick()

    expect(items(wrapper)[0].text()).not.toBe(before)
    wrapper.unmount()
  })

  it('набор объявлен от полного списка и садится на `role="listitem"`', () => {
    const wrapper = mountList({ virtual: true, maxHeight: 400 })
    const first = items(wrapper)[0]

    expect(first.attributes('aria-setsize')).toBe(String(TOTAL))
    expect(first.attributes('aria-posinset')).toBe('1')
    wrapper.unmount()
  })

  it('в обычном режиме набор не объявляется: его видно по DOM', () => {
    const wrapper = mountList({ items: manyItems(5), maxHeight: 400 })

    expect(items(wrapper)[0].attributes('aria-setsize')).toBeUndefined()
    expect(items(wrapper)[0].attributes('aria-posinset')).toBeUndefined()
    wrapper.unmount()
  })

  it('`scrollToIndex` доводит до пункта вне окна', async () => {
    const wrapper = mountList({ virtual: true, maxHeight: 400 })

    expect(wrapper.text()).not.toContain('Item 900')

    const api = wrapper.vm as unknown as { scrollToIndex: (index: number) => void }
    api.scrollToIndex(899)
    await nextTick()

    expect(wrapper.text()).toContain('Item 900')
    wrapper.unmount()
  })

  it('сокращение набора не оставляет окно за его пределами', async () => {
    const wrapper = mountList({ virtual: true, maxHeight: 400 })
    const box = wrapper.get('[data-gr-list]').element as HTMLElement

    box.scrollTop = 8000
    box.dispatchEvent(new Event('scroll'))
    await nextTick()

    await wrapper.setProps({ items: manyItems(3) })
    await nextTick()

    expect(items(wrapper)).toHaveLength(3)
    wrapper.unmount()
  })
})

describe('GrList — предупреждения о неверном включении', () => {
  it('`virtual` без `items` — резать нечего', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const wrapper = mount(GrList, {
      props: { virtual: true, maxHeight: 400 },
      slots: { default: '<GrListItem title="Один" />' },
      global: { components: { GrListItem } },
    })

    expect(warn.mock.calls.flat().join(' ')).toContain('`virtual` требует `items`')
    // Список при этом остаётся рабочим: рисуется прежний слот.
    expect(items(wrapper)).toHaveLength(1)
    wrapper.unmount()
  })

  it('`virtual` без `maxHeight` — вьюпорта нет', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const wrapper = mountList({ virtual: true, items: manyItems(30) })

    expect(warn.mock.calls.flat().join(' ')).toContain('`virtual` требует `maxHeight`')
    expect(items(wrapper)).toHaveLength(30)
    wrapper.unmount()
  })

  it('`items` без слота `#item` — пункты рисовать нечем', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const wrapper = mount(GrList, { props: { items: manyItems(3) } })

    expect(warn.mock.calls.flat().join(' ')).toContain('слот `#item`')
    wrapper.unmount()
  })

  it('забытый `v-bind="aria"` не проходит молча', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    // Ровно та ошибка, из-за которой диктор объявил бы «7 из 2000»: разметка
    // валидна, тесты потребителя зелёные, набор посчитан по окну.
    const wrapper = mountList({ virtual: true, maxHeight: 400 }, '<GrListItem :title="item.name" />')

    expect(warn.mock.calls.flat().join(' ')).toContain('aria-posinset')
    wrapper.unmount()
  })

  it('правильно включённая виртуализация молчит', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const wrapper = mountList({ virtual: true, maxHeight: 400 })

    expect(warn).not.toHaveBeenCalled()
    wrapper.unmount()
  })
})
