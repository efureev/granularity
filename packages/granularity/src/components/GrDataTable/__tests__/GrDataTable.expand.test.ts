import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { describe, expect, it, vi } from 'vitest'

import GrDataTable from '../GrDataTable.vue'

const ROWS = [
  { id: 1, name: 'Ada' },
  { id: 2, name: 'Grace' },
  { id: 3, name: 'Linus' },
]

const COLUMNS = [{ key: 'name', label: 'Name' }]

function mountTable(props: Record<string, unknown> = {}, slots: Record<string, string> = {}) {
  return mount(GrDataTable, {
    props: { rows: ROWS, columns: COLUMNS, expandable: true, ...props },
    slots: { detail: '<div data-testid="detail">подробности</div>', ...slots },
  })
}

/** Дождаться, пока промис `loadDetail` разрешится и Vue перерисует строку. */
async function settle(): Promise<void> {
  await nextTick()
  await Promise.resolve()
  await nextTick()
}

describe('GrDataTable — раскрытие строки', () => {
  it('без раскрытия второго яруса в разметке нет', () => {
    const wrapper = mountTable()

    expect(wrapper.findAll('[data-gr-datatable-expand]')).toHaveLength(3)
    expect(wrapper.find('[data-gr-datatable-detail]').exists()).toBe(false)
  })

  it('uncontrolled: клик раскрывает строку и эмитит ключ', async () => {
    const wrapper = mountTable()

    await wrapper.findAll('[data-gr-datatable-expand]')[1].trigger('click')

    expect(wrapper.find('[data-testid="detail"]').exists()).toBe(true)
    expect(wrapper.emitted('update:expandedKeys')?.at(-1)).toEqual([[2]])
    expect(wrapper.emitted('expand')?.[0]).toEqual([{ row: ROWS[1], key: 2 }])
  })

  it('controlled: состояние приходит пропом, внутреннее его не подменяет', async () => {
    const wrapper = mountTable({ expandedKeys: [1] })

    expect(wrapper.findAll('[data-gr-datatable-detail]')).toHaveLength(1)

    await wrapper.findAll('[data-gr-datatable-expand]')[2].trigger('click')

    // Проп не сменился — разметка обязана остаться прежней.
    expect(wrapper.findAll('[data-gr-datatable-detail]')).toHaveLength(1)
    expect(wrapper.emitted('update:expandedKeys')?.at(-1)).toEqual([[1, 3]])
  })

  it('accordion оставляет раскрытой одну строку', async () => {
    const wrapper = mountTable({ accordion: true })

    await wrapper.findAll('[data-gr-datatable-expand]')[0].trigger('click')
    await wrapper.findAll('[data-gr-datatable-expand]')[2].trigger('click')

    expect(wrapper.findAll('[data-gr-datatable-detail]')).toHaveLength(1)
    expect(wrapper.emitted('update:expandedKeys')?.at(-1)).toEqual([[3]])
  })

  it('expandableRow убирает кнопку у строки без второго яруса', () => {
    const wrapper = mountTable({ expandableRow: (row: { id: number }) => row.id !== 2 })

    expect(wrapper.findAll('[data-gr-datatable-expand]')).toHaveLength(2)
  })

  /**
   * Кнопка живёт внутри строки, у которой свой обработчик клика. Без остановки
   * всплытия раскрытие выделяло бы строку и стреляло навигацией потребителя.
   */
  it('клик по кнопке не выделяет строку и не эмитит rowClick', async () => {
    const wrapper = mountTable({ selectable: true })

    await wrapper.findAll('[data-gr-datatable-expand]')[0].trigger('click')

    expect(wrapper.emitted('rowClick')).toBeUndefined()
    expect(wrapper.emitted('update:selected')).toBeUndefined()
  })

  it('строка деталей объявлена служебной и связана с кнопкой', async () => {
    const wrapper = mountTable()
    const button = wrapper.findAll('[data-gr-datatable-expand]')[0]

    expect(button.attributes('aria-expanded')).toBe('false')

    await button.trigger('click')

    expect(button.attributes('aria-expanded')).toBe('true')

    const detail = wrapper.find('[data-gr-datatable-detail]')
    expect(detail.attributes('id')).toBe(button.attributes('aria-controls'))
    // Полосатость и подсветка обязаны считать её чужой — иначе она сдвинет
    // чётность всех строк ниже.
    expect(detail.attributes('data-gr-table-off-grid')).toBeDefined()
    expect(detail.attributes('aria-rowindex')).toBeUndefined()
  })

  it('с virtual раскрытие выключено и предупреждает', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const wrapper = mountTable({ virtual: true, maxHeight: 200 })

    expect(wrapper.find('[data-gr-datatable-expand]').exists()).toBe(false)
    expect(warn.mock.calls.flat().join(' ')).toContain('`expandable` вместе с `virtual`')

    warn.mockRestore()
  })
})

describe('GrDataTable — подгрузка подробностей', () => {
  it('раскрытие запускает загрузку, ответ попадает в слот', async () => {
    // Промис держим сами: у мгновенно разрешённого промежуточное состояние
    // проскакивает в том же микротаске, и тест ловил бы удачу, а не поведение.
    let resolveDetail: ((value: unknown) => void) | undefined
    const loadDetail = vi.fn(() => new Promise((resolve) => {
      resolveDetail = resolve
    }))

    const wrapper = mountTable({ loadDetail })

    await wrapper.findAll('[data-gr-datatable-expand]')[0].trigger('click')
    expect(wrapper.find('[data-gr-datatable-detail-loading]').exists()).toBe(true)
    // Именно скелет, а не пустая коробка: проп `GrSkeleton` называется `count`,
    // и с ошибочным именем он молча уходил в `$attrs`.
    expect(wrapper.findAll('[data-gr-datatable-detail-loading] [data-gr-skeleton]')).toHaveLength(2)

    resolveDetail?.({ note: 'из сети' })
    await settle()

    expect(loadDetail).toHaveBeenCalledTimes(1)
    expect(wrapper.find('[data-gr-datatable-detail-loading]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="detail"]').exists()).toBe(true)
  })

  it('загруженное держится: повторное раскрытие запроса не шлёт', async () => {
    const loadDetail = vi.fn().mockResolvedValue({})
    const wrapper = mountTable({ loadDetail })
    const button = wrapper.findAll('[data-gr-datatable-expand]')[0]

    await button.trigger('click')
    await settle()
    await button.trigger('click')
    await button.trigger('click')
    await settle()

    expect(loadDetail).toHaveBeenCalledTimes(1)
  })

  it('отказ показывает повтор и эмитит наружу', async () => {
    const loadDetail = vi.fn().mockRejectedValue(new Error('нет связи'))
    const wrapper = mountTable({ loadDetail })

    await wrapper.findAll('[data-gr-datatable-expand]')[0].trigger('click')
    await settle()

    expect(wrapper.find('[data-gr-datatable-detail-error]').exists()).toBe(true)
    expect(wrapper.emitted('detailLoadError')?.[0]?.[0]).toMatchObject({ key: 1 })

    loadDetail.mockResolvedValueOnce({ ok: true })
    await wrapper.find('[data-gr-datatable-detail-error] button').trigger('click')
    await settle()

    expect(wrapper.find('[data-gr-datatable-detail-error]').exists()).toBe(false)
    expect(loadDetail).toHaveBeenCalledTimes(2)
  })

  /**
   * Строку сворачивают чаще, чем дожидаются ответа: запрос обязан отменяться,
   * иначе он допишет подробности в строку, которой на экране уже нет.
   */
  it('сворачивание отменяет летящий запрос', async () => {
    let seenSignal: AbortSignal | undefined
    const loadDetail = vi.fn((_row: unknown, signal: AbortSignal) => {
      seenSignal = signal
      return new Promise(() => {})
    })
    const wrapper = mountTable({ loadDetail })
    const button = wrapper.findAll('[data-gr-datatable-expand]')[0]

    await button.trigger('click')
    expect(seenSignal?.aborted).toBe(false)

    await button.trigger('click')
    expect(seenSignal?.aborted).toBe(true)
  })

  it('поздний ответ раннего запроса проигрывает свежему', async () => {
    const resolvers: Array<(value: unknown) => void> = []
    const loadDetail = vi.fn(() => new Promise((resolve) => {
      resolvers.push(resolve)
    }))

    const wrapper = mountTable(
      { loadDetail },
      { detail: '<div data-testid="detail">{{ params.data?.tag }}</div>' },
    )
    const button = wrapper.findAll('[data-gr-datatable-expand]')[0]

    await button.trigger('click') // запрос №1
    await button.trigger('click') // свернули — №1 устарел
    await button.trigger('click') // запрос №2
    await settle()

    resolvers[1]?.({ tag: 'свежий' })
    await settle()
    resolvers[0]?.({ tag: 'устаревший' })
    await settle()

    expect(wrapper.find('[data-testid="detail"]').text()).toBe('свежий')
  })

  it('замена набора сбрасывает загруженное', async () => {
    const loadDetail = vi.fn().mockResolvedValue({})
    const wrapper = mountTable({ loadDetail })

    await wrapper.findAll('[data-gr-datatable-expand]')[0].trigger('click')
    await settle()

    await wrapper.setProps({ rows: [...ROWS] })
    await wrapper.findAll('[data-gr-datatable-expand]')[0].trigger('click')
    await wrapper.findAll('[data-gr-datatable-expand]')[0].trigger('click')
    await settle()

    expect(loadDetail).toHaveBeenCalledTimes(2)
  })
})

describe('GrDataTable — служебные колонки в colspan', () => {
  /**
   * Панель подробностей обязана дотягиваться до последней колонки. Пока
   * `totalColumns` не считал колонку раскрытия, она обрывалась на колонку
   * раньше — и правый край таблицы оставался пустым.
   */
  it('строка подробностей перекрывает все колонки, включая служебные', async () => {
    const wrapper = mountTable({ selectable: true })
    await wrapper.findAll('[data-gr-datatable-expand]')[0].trigger('click')

    const detailCell = wrapper.get('[data-gr-datatable-detail] td')
    // 1 колонка данных + выбор + раскрытие
    expect(detailCell.attributes('colspan')).toBe('3')
  })

  it('без раскрытия служебная колонка в счёт не идёт', () => {
    const wrapper = mount(GrDataTable, {
      props: { rows: ROWS, columns: COLUMNS, selectable: true, loading: true },
    })

    expect(wrapper.get('tbody td').attributes('colspan')).toBe('2')
  })
})

describe('GrDataTable — своя кнопка вместо служебной колонки', () => {
  it('expandColumn=false убирает колонку, но раскрытие остаётся', async () => {
    const wrapper = mount(GrDataTable, {
      props: { rows: ROWS, columns: COLUMNS, expandable: true, expandColumn: false },
      slots: {
        'cell-name': `<template #cell-name="{ row, expanded, toggleExpand }">
          <button data-testid="own" :aria-expanded="expanded" @click="toggleExpand">{{ row.name }}</button>
        </template>`,
        'detail': '<div data-testid="detail">подробности</div>',
      },
    })

    expect(wrapper.find('[data-gr-datatable-expand]').exists()).toBe(false)
    expect(wrapper.find('[data-gr-datatable-expand-head]').exists()).toBe(false)

    const own = wrapper.findAll('[data-testid="own"]')[1]
    expect(own.attributes('aria-expanded')).toBe('false')

    await own.trigger('click')

    expect(wrapper.find('[data-testid="detail"]').exists()).toBe(true)
    expect(own.attributes('aria-expanded')).toBe('true')
  })

  it('без служебной колонки colspan её не считает', async () => {
    const wrapper = mount(GrDataTable, {
      props: { rows: ROWS, columns: COLUMNS, expandable: true, expandColumn: false, expandedKeys: [1] },
      slots: { detail: '<div>подробности</div>' },
    })

    expect(wrapper.get('[data-gr-datatable-detail] td').attributes('colspan')).toBe('1')
  })
})

describe('GrDataTable — раскрытие переживает перестановку строк', () => {
  /**
   * Состояние живёт по ключу строки, а не по индексу. Привязка к позиции
   * показала бы подробности соседа: после сортировки на месте раскрытой
   * строки стоит уже другая.
   */
  it('после сортировки раскрытой остаётся та же строка', async () => {
    const wrapper = mountTable({ initialSortKey: 'name', initialSortDir: 'asc' })

    // По возрастанию имени первой идёт Ada (ключ 1).
    await wrapper.findAll('[data-gr-datatable-expand]')[0].trigger('click')
    expect(wrapper.emitted('update:expandedKeys')?.at(-1)).toEqual([[1]])

    await wrapper.setProps({ sortDir: 'desc' })

    // Порядок перевернулся: Ada теперь последняя, но раскрыта по-прежнему она.
    const rows = wrapper.findAll('[data-gr-datatable-row]')
    const detailRow = wrapper.get('[data-gr-datatable-detail]')
    expect(rows.at(-1)?.attributes('data-row-key')).toBe('1')
    expect(detailRow.attributes('id')).toContain('1')

    // И ровно одна: раскрытие не «переехало» на соседа по позиции.
    expect(wrapper.findAll('[data-gr-datatable-detail]')).toHaveLength(1)
  })
})
