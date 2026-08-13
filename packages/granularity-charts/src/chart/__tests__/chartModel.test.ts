import { describe, expect, it, vi } from 'vitest'

import { extentOf, inferScaleKind, normalizeChartData, padDomain } from '../chartModel'

/** Предупреждения о кривом входе — часть контракта; в тестах их глушим адресно. */
function silenceWarnings(): () => void {
  const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})

  return () => spy.mockRestore()
}

describe('inferScaleKind', () => {
  it('различает время, категории и числа', () => {
    expect(inferScaleKind([{ id: 'a', data: [{ x: new Date(), y: 1 }] }])).toBe('time')
    expect(inferScaleKind([{ id: 'a', data: [{ x: 'мар', y: 1 }] }])).toBe('band')
    expect(inferScaleKind([{ id: 'a', data: [{ x: 5, y: 1 }] }])).toBe('linear')
  })

  it('пропускает пустые серии и падает на linear, если данных нет', () => {
    expect(inferScaleKind([{ id: 'empty', data: [] }, { id: 'b', data: [{ x: 'q', y: 1 }] }])).toBe('band')
    expect(inferScaleKind([])).toBe('linear')
  })
})

describe('extentOf', () => {
  it('игнорирует пропуски', () => {
    expect(extentOf([1, null, 5, Number.NaN, 3])).toEqual([1, 5])
  })

  it('без единого значения отдаёт null', () => {
    expect(extentOf([null, Number.NaN])).toBeNull()
  })
})

describe('padDomain', () => {
  it('вырожденный размах разводит на половину единицы', () => {
    expect(padDomain([7, 7])).toEqual([6.5, 7.5])
  })

  it('includeZero притягивает ось к нулю', () => {
    expect(padDomain([10, 20], { includeZero: true })).toEqual([0, 20])
    expect(padDomain([-20, -10], { includeZero: true })).toEqual([-20, 0])
  })
})

describe('normalizeChartData', () => {
  it('голый ряд чисел становится одной серией с x по индексу', () => {
    const data = normalizeChartData([5, 7, 9])

    expect(data.series).toHaveLength(1)
    expect(data.kind).toBe('linear')
    expect(data.positions).toEqual([0, 1, 2])
    expect(data.series[0]!.points.map(p => p.y)).toEqual([5, 7, 9])
  })

  it('ряд, начинающийся с пропуска, остаётся рядом чисел', () => {
    // По нулевому элементу голый ряд неотличим от списка серий, и разобранный
    // не тем способом он падает на первом же обращении к `point.x`.
    const data = normalizeChartData([null, null, 5, 7])

    expect(data.series).toHaveLength(1)
    expect(data.series[0]!.points.map(point => point.y)).toEqual([null, null, 5, 7])
  })

  it('колоночный и объектный входы дают одно и то же', () => {
    const columnar = normalizeChartData([{ id: 'a', x: [1, 2], y: [10, 20] }])
    const objects = normalizeChartData([{ id: 'a', data: [{ x: 1, y: 10 }, { x: 2, y: 20 }] }])

    expect(columnar.series[0]!.points.map(p => [p.x, p.y])).toEqual(
      objects.series[0]!.points.map(p => [p.x, p.y]),
    )
  })

  it('дубли x не схлопываются — точка адресуется индексом', () => {
    const data = normalizeChartData([{ id: 'a', data: [{ x: 1, y: 10 }, { x: 1, y: 20 }] }])

    expect(data.series[0]!.points).toHaveLength(2)
    expect(data.series[0]!.points.map(p => p.sourceIndex)).toEqual([0, 1])
  })

  it('несортированный вход сортируется по x, а sourceIndex остаётся входным', () => {
    const data = normalizeChartData([{ id: 'a', data: [{ x: 3, y: 1 }, { x: 1, y: 2 }] }])

    expect(data.series[0]!.points.map(p => p.x)).toEqual([1, 3])
    expect(data.series[0]!.points.map(p => p.sourceIndex)).toEqual([1, 0])
  })

  it('sort: false сохраняет входной порядок', () => {
    const data = normalizeChartData([{ id: 'a', data: [{ x: 3, y: 1 }, { x: 1, y: 2 }] }], { sort: false })

    expect(data.series[0]!.points.map(p => p.x)).toEqual([3, 1])
  })

  it('порядок категорий у band — порядок входа, а не сортировка', () => {
    const data = normalizeChartData([{ id: 'a', data: [{ x: 'мар', y: 1 }, { x: 'янв', y: 2 }] }])

    expect(data.kind).toBe('band')
    expect(data.categories).toEqual(['мар', 'янв'])
    expect(data.series[0]!.points.map(p => p.x)).toEqual([0, 1])
  })

  it('серии разной длины объединяют категории по первому появлению', () => {
    const data = normalizeChartData([
      { id: 'a', data: [{ x: 'янв', y: 1 }, { x: 'фев', y: 2 }] },
      { id: 'b', data: [{ x: 'фев', y: 3 }, { x: 'мар', y: 4 }] },
    ])

    expect(data.categories).toEqual(['янв', 'фев', 'мар'])
    expect(data.positions).toEqual([0, 1, 2])
  })

  it('дубль категории внутри серии объединяется с предупреждением', () => {
    const restore = silenceWarnings()

    expect(normalizeChartData([{ id: 'a', data: [{ x: 'янв', y: 1 }, { x: 'янв', y: 2 }] }]).categories)
      .toEqual(['янв'])
    expect(console.warn).toHaveBeenCalledOnce()
    restore()
  })

  it('общие категории у разных серий — норма, а не повод предупреждать', () => {
    // Ось у серий общая по построению: предупреждение здесь спамило бы консоль
    // на каждом мультисерийном графике.
    const restore = silenceWarnings()

    const data = normalizeChartData([
      { id: 'a', data: [{ x: 'янв', y: 1 }, { x: 'фев', y: 2 }] },
      { id: 'b', data: [{ x: 'янв', y: 3 }, { x: 'фев', y: 4 }] },
    ])

    expect(data.categories).toEqual(['янв', 'фев'])
    expect(console.warn).not.toHaveBeenCalled()
    restore()
  })

  it('data сильнее пары x/y и предупреждает об этом', () => {
    const restore = silenceWarnings()
    const data = normalizeChartData([{ id: 'a', data: [{ x: 9, y: 99 }], x: [1], y: [1] }])

    expect(data.series[0]!.points[0]!.y).toBe(99)
    expect(console.warn).toHaveBeenCalledOnce()
    restore()
  })

  it('NaN, Infinity и undefined становятся пропуском', () => {
    const data = normalizeChartData([{
      id: 'a',
      y: [1, Number.NaN, Number.POSITIVE_INFINITY, undefined as unknown as number, 5],
    }])

    expect(data.series[0]!.points.map(p => p.y)).toEqual([1, null, null, null, 5])
  })

  it('время переводится в epoch ms, а raw сохраняется', () => {
    const when = new Date(2026, 0, 15)
    const data = normalizeChartData([{ id: 'a', data: [{ x: when, y: 1 }] }])

    expect(data.kind).toBe('time')
    expect(data.series[0]!.points[0]!.x).toBe(when.getTime())
    expect(data.series[0]!.points[0]!.raw).toBe(when)
  })

  it('все значения равны — домен разводится, а не вырождается', () => {
    const data = normalizeChartData([{ id: 'a', y: [4, 4, 4] }])

    expect(data.yDomain).toEqual([3.5, 4.5])
  })

  it('единственная точка ставится в середину, а не в левый край', () => {
    const data = normalizeChartData([{ id: 'a', data: [{ x: 10, y: 1 }] }])

    expect(data.xDomain).toEqual([9.5, 10.5])
  })

  it('серия целиком из пропусков не роняет домен', () => {
    const data = normalizeChartData([{ id: 'a', y: [null, null] }])

    expect(data.yDomain).toEqual([0, 1])
    expect(data.series[0]!.points).toHaveLength(2)
  })

  it('пустая серия остаётся в наборе и удерживает свой индекс палитры', () => {
    const data = normalizeChartData([
      { id: 'empty', data: [] },
      { id: 'b', y: [1, 2] },
    ])

    expect(data.series).toHaveLength(2)
    expect(data.series[1]!.colorIndex).toBe(1)
    expect(data.series[1]!.style.color).toBe('var(--gr-chart-2)')
  })

  it('скрытая серия не растягивает ось и не даёт позиций', () => {
    const data = normalizeChartData([
      { id: 'a', y: [1, 2] },
      { id: 'b', x: [5, 6], y: [1000, 2000], hidden: true },
    ])

    expect(data.positions).toEqual([0, 1])
    expect(data.yDomain[1]).toBeLessThan(1000)
    expect(data.series[1]!.hidden).toBe(true)
  })

  it('yDomain переопределяется по сторонам независимо', () => {
    const data = normalizeChartData([{ id: 'a', y: [3, 8] }], { yDomain: [0, null] })

    expect(data.yDomain[0]).toBe(0)
    expect(data.yDomain[1]).toBe(8)
  })

  it('includeZero притягивает ось значений к нулю', () => {
    expect(normalizeChartData([{ id: 'a', y: [10, 20] }], { includeZero: true }).yDomain).toEqual([0, 20])
  })

  it('пустой вход даёт рабочий, а не сломанный набор', () => {
    const data = normalizeChartData([])

    expect(data.series).toEqual([])
    expect(data.positions).toEqual([])
    expect(data.xDomain).toEqual([0, 1])
  })
})
