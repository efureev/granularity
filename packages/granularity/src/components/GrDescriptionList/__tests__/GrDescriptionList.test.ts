import { mount } from '@vue/test-utils'
import { defineComponent, nextTick } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'

import GrConfigProvider from '../../GrConfigProvider/GrConfigProvider.vue'
import GrDescriptionList from '../GrDescriptionList.vue'

const items = [
  { label: 'Статус', value: 'Активен', name: 'status' },
  { label: 'Создан', value: '2026-08-17' },
  { label: 'Запрос', value: 'req_01HX', name: 'request' },
]

describe('GrDescriptionList', () => {
  // Ради этого компонент и заводится: в приложении дважды встретился `<dl>`
  // с голыми `<div>` внутри — ни парсер, ни скринридер пары там не видели.
  it('на каждую пару ровно один dt и один dd внутри dl', () => {
    const wrapper = mount(GrDescriptionList, { props: { items } })

    expect(wrapper.element.tagName).toBe('DL')

    const pairs = wrapper.findAll('[data-gr-description-pair]')
    expect(pairs).toHaveLength(3)

    for (const pair of pairs) {
      expect(pair.findAll('dt')).toHaveLength(1)
      expect(pair.findAll('dd')).toHaveLength(1)
    }

    expect(wrapper.findAll('dt').map(el => el.text())).toEqual(['Статус', 'Создан', 'Запрос'])
    expect(wrapper.findAll('dd').map(el => el.text())).toEqual(['Активен', '2026-08-17', 'req_01HX'])
  })

  // «Поле есть, значения нет» и «поля нет» — разные утверждения.
  it.each([
    ['null', null],
    ['undefined', undefined],
    ['пустую строку', ''],
  ])('печатает прочерк на %s, а не выбрасывает строку', (_name, value) => {
    const wrapper = mount(GrDescriptionList, {
      props: { items: [{ label: 'Статус', value }, { label: 'Создан', value: 'вчера' }] },
    })

    expect(wrapper.findAll('[data-gr-description-pair]')).toHaveLength(2)
    expect(wrapper.findAll('dd')[0].text()).toBe('—')
  })

  it('ноль — это значение, а не пустота', () => {
    const wrapper = mount(GrDescriptionList, { props: { items: [{ label: 'Ошибок', value: 0 }] } })

    expect(wrapper.get('dd').text()).toBe('0')
  })

  it('emptyText перекрывает прочерк, слот #empty — сильнее обоих', () => {
    const text = mount(GrDescriptionList, {
      props: { items: [{ label: 'Статус', value: null }], emptyText: 'нет данных' },
    })
    expect(text.get('dd').text()).toBe('нет данных')

    const slot = mount(GrDescriptionList, {
      props: { items: [{ label: 'Статус', value: null }], emptyText: 'нет данных' },
      slots: { empty: '<i>—</i>' },
    })
    expect(slot.find('dd i').exists()).toBe(true)
  })

  it('слот #value-<name> перебивает строковое значение', () => {
    const wrapper = mount(GrDescriptionList, {
      props: { items },
      slots: { 'value-status': '<b data-badge>Живой</b>' },
    })

    expect(wrapper.findAll('dd')[0].get('[data-badge]').text()).toBe('Живой')
    // Соседи без слота остаются строками.
    expect(wrapper.findAll('dd')[1].text()).toBe('2026-08-17')
  })

  it('слот #label-<name> перебивает подпись', () => {
    const wrapper = mount(GrDescriptionList, {
      props: { items },
      slots: { 'label-request': '<abbr data-abbr>Req</abbr>' },
    })

    expect(wrapper.findAll('dt')[2].get('[data-abbr]').text()).toBe('Req')
  })

  // Красная подпись читается как «поле сломано», хотя проблема в величине.
  it('тон красит только значение', () => {
    const wrapper = mount(GrDescriptionList, {
      props: { items: [{ label: 'Баланс', value: '-120', tone: 'danger' }] },
    })

    expect(wrapper.get('dd').classes()).toContain('text-[var(--gr-danger-text)]')
    expect(wrapper.get('dt').classes().join(' ')).not.toContain('danger')
  })

  it('inline держит колонку подписей, stacked её снимает', () => {
    const inline = mount(GrDescriptionList, { props: { items, labelWidth: '9rem' } })
    expect(inline.get('dt').attributes('style')).toContain('width: 9rem')
    expect(inline.get('[data-gr-description-pair]').classes()).toContain('items-baseline')

    const stacked = mount(GrDescriptionList, { props: { items, layout: 'stacked' } })
    expect(stacked.get('dt').attributes('style')).toBeUndefined()
  })

  // В узкой колонке фиксированная подпись выжимает значение в букву на строку.
  it('ниже stackBelow inline переключается на stacked', async () => {
    const observers: Array<(entries: Array<{ contentRect: { width: number } }>) => void> = []

    vi.stubGlobal('ResizeObserver', class {
      constructor(callback: (entries: Array<{ contentRect: { width: number } }>) => void) {
        observers.push(callback)
      }

      observe() {}
      disconnect() {}
    })

    const wrapper = mount(GrDescriptionList, { props: { items, stackBelow: 480 } })

    // До измерения действует заданная раскладка — это же и серверный рендер.
    expect(wrapper.get('dt').attributes('style')).toContain('width')

    observers[0]([{ contentRect: { width: 320 } }])
    await nextTick()
    expect(wrapper.get('dt').attributes('style')).toBeUndefined()

    observers[0]([{ contentRect: { width: 900 } }])
    await nextTick()
    expect(wrapper.get('dt').attributes('style')).toContain('width')
  })

  // `column-count` раскладывает поток и разорвал бы пару между колонками.
  it('columns=2 не рвёт пару: dt и dd остаются в одном элементе сетки', () => {
    const wrapper = mount(GrDescriptionList, { props: { items, columns: 2 } })

    expect(wrapper.classes()).toContain('sm:grid-cols-2')
    expect(wrapper.classes().some(cls => cls.startsWith('columns-'))).toBe(false)

    for (const pair of wrapper.findAll('[data-gr-description-pair]')) {
      expect(pair.findAll('dt')).toHaveLength(1)
      expect(pair.findAll('dd')).toHaveLength(1)
    }
  })

  it('divided отбивает пары линией, кроме последней', () => {
    const wrapper = mount(GrDescriptionList, { props: { items, divided: true } })

    expect(wrapper.get('[data-gr-description-pair]').classes()).toContain('last:border-b-0')
  })

  it('пустой список рендерит пустой dl без пар', () => {
    const wrapper = mount(GrDescriptionList, { props: { items: [] } })

    expect(wrapper.element.tagName).toBe('DL')
    expect(wrapper.findAll('[data-gr-description-pair]')).toHaveLength(0)
  })

  it('оформление читается из GrConfigProvider', () => {
    const Harness = defineComponent({
      components: { GrConfigProvider, GrDescriptionList },
      setup: () => ({ items }),
      template: `
        <GrConfigProvider :component-defaults="{ GrDescriptionList: { layout: 'stacked', emptyText: 'н/д', columns: 2 } }">
          <GrDescriptionList :items="[{ label: 'Статус', value: null }]" />
        </GrConfigProvider>
      `,
    })

    const wrapper = mount(Harness)
    expect(wrapper.get('dd').text()).toBe('н/д')
    expect(wrapper.get('dt').attributes('style')).toBeUndefined()
    expect(wrapper.get('[data-gr-description-list]').classes()).toContain('sm:grid-cols-2')
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
})
