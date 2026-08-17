import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue'
import { describe, expect, it, vi } from 'vitest'

vi.mock('~icons/lucide/arrow-up', () => ({
  default: defineComponent({ name: 'IconArrowUp', render: () => h('svg', { 'data-icon': 'arrow-up' }) }),
}))
vi.mock('~icons/lucide/arrow-down', () => ({
  default: defineComponent({ name: 'IconArrowDown', render: () => h('svg', { 'data-icon': 'arrow-down' }) }),
}))

import GrDataTable from '../GrDataTable.vue'

/**
 * Виртуализация строк.
 *
 * jsdom не считает layout: высота контейнера и строк там нулевая, поэтому окно
 * считается от объявленного `maxHeight` и оценки строки. Геометрию после
 * настоящего замера проверяет спек композабла (`useVirtualList.test.ts`), здесь —
 * контракт таблицы: что попадает в DOM, как устроены строки-распорки и что
 * говорит ARIA о числе строк.
 */

type Row = { id: number, name: string, score: number }

const TOTAL = 1000

const columns = [
  { key: 'name' as const, label: 'Name', sortable: true, width: 240 },
  { key: 'score' as const, label: 'Score', sortable: true, width: '30%' },
]

function manyRows(count = TOTAL): Row[] {
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    name: `Row ${index + 1}`,
    score: count - index,
  }))
}

function mountTable(props: Record<string, unknown> = {}) {
  return mount(GrDataTable, {
    props: { rows: manyRows(), columns, ariaLabel: 'People', ...props },
    attachTo: document.body,
  })
}

function dataRows(wrapper: ReturnType<typeof mountTable>) {
  return wrapper.findAll('[data-gr-datatable-row]')
}

function spacers(wrapper: ReturnType<typeof mountTable>) {
  return wrapper.findAll('[data-gr-datatable-spacer]')
}

describe('GrDataTable — виртуализация', () => {
  it('без пропа рендерит все строки и не объявляет их число', () => {
    const wrapper = mountTable({ rows: manyRows(120) })

    expect(dataRows(wrapper)).toHaveLength(120)
    expect(spacers(wrapper)).toHaveLength(0)
    expect(wrapper.get('[data-gr-table]').attributes('aria-rowcount')).toBeUndefined()
    expect(dataRows(wrapper)[0].attributes('aria-rowindex')).toBeUndefined()
    wrapper.unmount()
  })

  it('с `virtual` держит в DOM окно, а не все строки', () => {
    const wrapper = mountTable({ virtual: true, maxHeight: 400 })

    const rendered = dataRows(wrapper).length
    expect(rendered).toBeGreaterThan(0)
    expect(rendered).toBeLessThan(50)
    wrapper.unmount()
  })

  it('срезанное держат строки-распорки, скрытые от AT', () => {
    const wrapper = mountTable({ virtual: true, maxHeight: 400 })
    const box = wrapper.get('[data-gr-table-scroll]').element as HTMLElement

    box.scrollTop = 8000
    box.dispatchEvent(new Event('scroll'))

    // Обе распорки появляются, только когда есть что срезать с обеих сторон.
    const rows = spacers(wrapper)
    expect(rows.length).toBeGreaterThan(0)

    for (const spacer of rows) {
      expect(spacer.attributes('aria-hidden')).toBe('true')
      // Ячейка обязана перекрыть все колонки, иначе раскладка поедет.
      expect(spacer.get('td').attributes('colspan')).toBe(String(columns.length))
      expect(spacer.get('td').attributes('style')).toContain('height')
    }

    wrapper.unmount()
  })

  it('число строк и их номера объявлены от полного набора', async () => {
    const wrapper = mountTable({ virtual: true, maxHeight: 400 })
    await nextTick()

    // Заголовок — строка первая, поэтому набор начинается со второй.
    expect(wrapper.get('[data-gr-table]').attributes('aria-rowcount')).toBe(String(TOTAL + 1))
    expect(wrapper.get('[data-gr-datatable-header]').attributes('aria-rowindex')).toBe('1')
    expect(dataRows(wrapper)[0].attributes('aria-rowindex')).toBe('2')
    wrapper.unmount()
  })

  // Итог — тоже строка таблицы, и `aria-rowcount` объявлен как «полное число
  // строк набора». Не учтя его, диктор считал бы на одну меньше, чем есть.
  it('итоговая строка входит в число строк и получает свой номер', async () => {
    const wrapper = mountTable({ virtual: true, maxHeight: 400, summaryRow: { score: 0 } })
    await nextTick()

    expect(wrapper.get('[data-gr-table]').attributes('aria-rowcount')).toBe(String(TOTAL + 2))
    expect(wrapper.get('[data-gr-datatable-summary]').attributes('aria-rowindex')).toBe(String(TOTAL + 2))
    wrapper.unmount()
  })

  it('без виртуализации номеров у итога нет — их считает диктор по разметке', () => {
    const wrapper = mountTable({ rows: manyRows(3), summaryRow: { score: 0 } })

    expect(wrapper.get('[data-gr-table]').attributes('aria-rowcount')).toBeUndefined()
    expect(wrapper.get('[data-gr-datatable-summary]').attributes('aria-rowindex')).toBeUndefined()
    wrapper.unmount()
  })

  it('прокрутка сдвигает окно, и номера строк едут вместе с ним', async () => {
    const wrapper = mountTable({ virtual: true, maxHeight: 400 })
    const box = wrapper.get('[data-gr-table-scroll]').element as HTMLElement

    const before = dataRows(wrapper)[0].attributes('data-row-key')

    box.scrollTop = 8000
    box.dispatchEvent(new Event('scroll'))
    await nextTick()

    const first = dataRows(wrapper)[0]
    expect(first.attributes('data-row-key')).not.toBe(before)
    expect(Number(first.attributes('aria-rowindex'))).toBeGreaterThan(100)
    wrapper.unmount()
  })

  it('выключает браузерный якорь прокрутки', () => {
    const virtual = mountTable({ virtual: true, maxHeight: 400 })
    // Якорь удерживает видимый узел, подправляя `scrollTop` при изменении
    // высоты содержимого выше него, — а окно меняет её на каждом кадре.
    expect(virtual.get('[data-gr-table-scroll]').attributes('style')).toContain('overflow-anchor: none')
    virtual.unmount()

    const plain = mountTable({ rows: manyRows(3), maxHeight: 400 })
    expect(plain.get('[data-gr-table-scroll]').attributes('style') ?? '').not.toContain('overflow-anchor')
    plain.unmount()
  })

  it('фиксирует раскладку и отдаёт ширины колонок заголовку', () => {
    const wrapper = mountTable({ virtual: true, maxHeight: 400 })

    // Без фиксации ширины считались бы по отрисованному окну и прыгали.
    expect(wrapper.get('[data-gr-table]').classes()).toContain('[table-layout:fixed]')

    const headers = wrapper.findAll('[data-gr-datatable-header] th')
    expect(headers[0].attributes('style')).toContain('width: 240px')
    expect(headers[1].attributes('style')).toContain('width: 30%')
    wrapper.unmount()
  })

  it('ширина колонки работает и без виртуализации', () => {
    const wrapper = mountTable({ rows: manyRows(3) })

    expect(wrapper.get('[data-gr-table]').classes()).not.toContain('[table-layout:fixed]')
    expect(wrapper.findAll('[data-gr-datatable-header] th')[0].attributes('style')).toContain('width: 240px')
    wrapper.unmount()
  })

  it('`scrollToRow` доводит до строки вне окна', async () => {
    const wrapper = mountTable({ virtual: true, maxHeight: 400 })
    await nextTick()

    expect(wrapper.find('[data-row-key="900"]').exists()).toBe(false)

    const api = wrapper.vm as unknown as { scrollToRow: (key: number) => boolean }
    // До правки метод искал строку по DOM и на строке вне окна отвечал `false`.
    expect(api.scrollToRow(900)).toBe(true)

    await nextTick()
    await nextTick()
    expect(wrapper.find('[data-row-key="900"]').exists()).toBe(true)
    wrapper.unmount()
  })

  it('`scrollToRow` по несуществующему ключу по-прежнему отвечает `false`', async () => {
    const wrapper = mountTable({ virtual: true, maxHeight: 400 })
    await nextTick()

    const api = wrapper.vm as unknown as { scrollToRow: (key: number) => boolean }
    expect(api.scrollToRow(999_999)).toBe(false)
    wrapper.unmount()
  })

  it('сортировка пересобирает набор, и номера строк следуют новому порядку', async () => {
    const wrapper = mountTable({ virtual: true, maxHeight: 400, initialSortKey: 'score' })
    await nextTick()

    const first = dataRows(wrapper)[0]
    // `score` убывает с ростом `id`, поэтому по возрастанию первой идёт последняя строка.
    expect(first.attributes('data-row-key')).toBe(String(TOTAL))
    expect(first.attributes('aria-rowindex')).toBe('2')
    wrapper.unmount()
  })
})
