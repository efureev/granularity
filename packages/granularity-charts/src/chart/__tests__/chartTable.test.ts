import { describe, expect, it } from 'vitest'

import { normalizeChartData } from '../chartModel'
import { chartTableModel, trimTableModel } from '../chartTable'

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

describe('chartTableModel: примечания', () => {
  it('модель без примечаний их не заводит — поле опционально и по умолчанию отсутствует', () => {
    const table = chartTableModel(normalizeChartData([{ id: 'a', y: [1] }]), options)

    expect(table.notes).toBeUndefined()
  })

  it('примечание не занимает места в строках и не меняет число колонок', () => {
    // Примечание дописывает рама поверх модели: у порога нет позиции по X, и
    // строкой данных он быть не может.
    const base = chartTableModel(normalizeChartData([{ id: 'a', y: [1, 2] }]), options)
    const withNotes = { ...base, notes: ['Порог: критический 1'] }

    expect(withNotes.rows).toEqual(base.rows)
    expect(withNotes.columns).toEqual(base.columns)
  })
})

describe('chartTableModel: две оси', () => {
  const dual = () => normalizeChartData([
    { id: 'mrr', label: 'MRR', y: [40000], axis: 'right' as const },
    { id: 'active', label: 'Активные', y: [120] },
  ], { dualAxis: true })

  const axisLabel = (axis: 'left' | 'right') => (axis === 'right' ? 'правая ось' : 'левая ось')

  it('колонка называет свою ось, когда осей две', () => {
    // Значения из разных шкал, стоящие рядом без пояснения, — дезинформация.
    const table = chartTableModel(dual(), { ...options, axisLabel })

    expect(table.columns.map(column => column.label))
      .toEqual(['X', 'MRR (правая ось)', 'Активные (левая ось)'])
  })

  it('у одноосного графика пометки нет: «(левая ось)» это шум', () => {
    const table = chartTableModel(normalizeChartData([{ id: 'a', label: 'Продажи', y: [1] }]), {
      ...options,
      axisLabel,
    })

    expect(table.columns.map(column => column.label)).toEqual(['X', 'Продажи'])
  })

  it('ось остаётся машиночитаемой и без подписи', () => {
    const table = chartTableModel(dual(), options)

    expect(table.columns.map(column => column.axis)).toEqual([undefined, 'right', 'left'])
  })

  it('формат значения получает ось второй колонкой', () => {
    const table = chartTableModel(dual(), {
      ...options,
      formatY: (value, axis) => `${value}/${axis}`,
    })

    expect(table.rows[0]!.cells).toEqual(['40000/right', '120/left'])
  })
})

describe('trimTableModel', () => {
  const modelOf = (rows: number) => ({
    caption: 'c',
    columns: [{ key: 'x', label: 'X' }],
    rows: Array.from({ length: rows }, (_, index) => ({ header: String(index), cells: [String(index)] })),
  })

  it('ряд ниже потолка возвращается той же ссылкой', () => {
    const model = modelOf(10)

    expect(trimTableModel(model, 500)).toBe(model)
    expect(trimTableModel(model, 10)).toBe(model)
  })

  it('усекает до потолка и сохраняет концы', () => {
    // Таблица без первой и последней строки врёт о границах данных.
    const trimmed = trimTableModel(modelOf(1000), 100)

    expect(trimmed.rows).toHaveLength(100)
    expect(trimmed.rows[0]!.header).toBe('0')
    expect(trimmed.rows.at(-1)!.header).toBe('999')
  })

  it('выборка равномерная и без повторов', () => {
    const trimmed = trimTableModel(modelOf(1000), 5)
    const headers = trimmed.rows.map(row => Number(row.header))

    // Шаг — (n−1)/(k−1) с округлением: 999/4 = 249.75.
    expect(headers).toEqual([0, 250, 500, 749, 999])
    expect(new Set(headers).size).toBe(headers.length)
  })

  it('потолок ниже двух строк не применяется: усекать до одной строки бессмысленно', () => {
    const model = modelOf(1000)

    expect(trimTableModel(model, 1)).toBe(model)
    expect(trimTableModel(model, Number.POSITIVE_INFINITY)).toBe(model)
  })

  it('колонки и примечания не трогаются', () => {
    const model = { ...modelOf(1000), notes: ['порог'] }
    const trimmed = trimTableModel(model, 10)

    expect(trimmed.columns).toBe(model.columns)
    expect(trimmed.notes).toEqual(['порог'])
  })
})
