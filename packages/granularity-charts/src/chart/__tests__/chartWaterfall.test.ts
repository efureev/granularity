import { describe, expect, it } from 'vitest'

import { waterfallSegments } from '../chartWaterfall'

const movement = [
  { label: 'Новые', value: 120 },
  { label: 'Отток', value: -45 },
  { label: 'Возвраты', value: 12 },
]

describe('waterfallSegments', () => {
  it('сумма дельт плюс начальное накопление равна вершине последнего шага', () => {
    const model = waterfallSegments(movement, { baseline: 500 })

    expect(model.total).toBe(587)
    expect(model.segments[model.segments.length - 1]!.to).toBe(587)
  })

  it('каждый столбец стоит там, где кончился предыдущий', () => {
    // Это и отличает мост от расходящихся столбцов: без преемственности он
    // отвечал бы на другой вопрос.
    const model = waterfallSegments(movement, { baseline: 500 })

    expect(model.segments.map(segment => [segment.from, segment.to]))
      .toEqual([[500, 620], [620, 575], [575, 587]])
  })

  it('шаг `total` задаёт накопление, а не прибавляется к нему', () => {
    const model = waterfallSegments([
      { label: 'На начало', value: 500, kind: 'total' },
      { label: 'Начислено', value: 120 },
      { label: 'На конец', value: 620, kind: 'total' },
    ])

    expect(model.segments.map(segment => segment.after)).toEqual([500, 620, 620])
    expect(model.total).toBe(620)
  })

  it('столбец `total` меряется от нуля, а дельта — от накопления', () => {
    const model = waterfallSegments([
      { label: 'На начало', value: 500, kind: 'total' },
      { label: 'Начислено', value: 120 },
    ])

    expect(model.segments[0]!.from).toBe(0)
    expect(model.segments[1]!.from).toBe(500)
  })

  it('к шагу `total` соединитель не ведёт: он объявляет накопление, а не продолжает', () => {
    const model = waterfallSegments([
      { label: 'Начислено', value: 120 },
      { label: 'На конец', value: 620, kind: 'total' },
    ])

    expect(model.segments[0]!.connector).toBeNull()
  })

  it('соединитель стоит на общем уровне соседних столбцов', () => {
    const model = waterfallSegments(movement, { baseline: 500 })

    expect(model.segments.map(segment => segment.connector)).toEqual([620, 575, null])
  })

  it('нулевой шаг даёт знак ноль — чтобы его нарисовали чертой, а не пустотой', () => {
    // «Движения не было» — это факт, и он обязан быть виден.
    const model = waterfallSegments([{ label: 'Списано', value: 0 }])

    expect(model.segments[0]!.sign).toBe(0)
    expect(model.segments[0]!.from).toBe(model.segments[0]!.to)
  })

  it('мост, уходящий ниже нуля, сохраняет знаки и границы', () => {
    const model = waterfallSegments([
      { label: 'Было', value: 10, kind: 'total' },
      { label: 'Списано', value: -30 },
    ])

    expect(model.segments[1]!.sign).toBe(-1)
    expect(model.segments[1]!.to).toBe(-20)
    expect(model.domain[0]).toBe(-20)
  })

  it('ось всегда включает ноль', () => {
    const model = waterfallSegments([{ label: 'Прирост', value: 5 }], { baseline: 900 })

    expect(model.domain).toEqual([0, 905])
  })

  it('`showTotal` добавляет столбец, но накопления не меняет', () => {
    const plain = waterfallSegments(movement, { baseline: 500 })
    const withTotal = waterfallSegments(movement, { baseline: 500, total: { label: 'Итого' } })

    expect(withTotal.total).toBe(plain.total)
    expect(withTotal.segments).toHaveLength(plain.segments.length + 1)
    expect(withTotal.segments[3]).toMatchObject({ label: 'Итого', kind: 'total', from: 0, to: 587 })
  })

  it('итоговый столбец получает индекс за концом входа', () => {
    const model = waterfallSegments(movement, { total: { label: 'Итого' } })

    expect(model.segments[3]!.index).toBe(movement.length)
  })

  it('пустой вход даёт пустой мост, а не деление на ноль', () => {
    const model = waterfallSegments([])

    expect(model.segments).toEqual([])
    expect(model.total).toBe(0)
    expect(model.domain).toEqual([0, 0])
  })

  it('нечисловое значение — это ноль, а не `NaN` на всём графике', () => {
    const model = waterfallSegments([{ label: 'Сбой', value: Number.NaN }, { label: 'Прирост', value: 5 }])

    expect(model.total).toBe(5)
    expect(model.segments[0]!.sign).toBe(0)
  })
})
