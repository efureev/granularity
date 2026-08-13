import { describe, expect, it } from 'vitest'

import { normalizeChartData } from '../chartModel'
import { chartTableModel } from '../chartTable'

const options = {
  xLabel: 'X',
  caption: 'Данные графика',
  formatX: (point: { raw: unknown }) => String(point.raw),
  formatY: (value: number | null) => (value === null ? '—' : String(value)),
}

describe('chartTableModel', () => {
  it('колонка на серию плюс колонка оси X', () => {
    const data = normalizeChartData([
      { id: 'a', label: 'Продажи', y: [1, 2] },
      { id: 'b', label: 'Возвраты', y: [3, 4] },
    ])
    const table = chartTableModel(data, options)

    expect(table.columns.map(column => column.label)).toEqual(['X', 'Продажи', 'Возвраты'])
    expect(table.rows).toHaveLength(2)
    expect(table.rows[0]!.cells).toEqual(['1', '3'])
  })

  it('рваные серии дают «—», а не сдвиг колонок', () => {
    const data = normalizeChartData([
      { id: 'a', x: [0, 1, 2], y: [1, null, 3] },
      { id: 'b', x: [0, 2], y: [9, 9] },
    ])
    const table = chartTableModel(data, options)

    expect(table.rows.map(row => row.cells)).toEqual([['1', '9'], ['—', '—'], ['3', '9']])
  })

  it('скрытая серия в таблицу не попадает — таблица обязана совпадать с рисунком', () => {
    const data = normalizeChartData([
      { id: 'a', y: [1] },
      { id: 'b', y: [2], hidden: true },
    ])
    const table = chartTableModel(data, options)

    expect(table.columns).toHaveLength(2)
    expect(table.rows[0]!.cells).toEqual(['1'])
  })

  it('подпись строки берётся из исходного значения x', () => {
    const data = normalizeChartData([{ id: 'a', data: [{ x: 'янв', y: 1 }, { x: 'фев', y: 2 }] }])
    const table = chartTableModel(data, options)

    expect(table.rows.map(row => row.header)).toEqual(['янв', 'фев'])
  })

  it('пустой набор даёт таблицу без строк, а не падение', () => {
    expect(chartTableModel(normalizeChartData([]), options).rows).toEqual([])
  })
})
