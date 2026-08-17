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

describe('normalizeChartData: стек', () => {
  const series = [
    { id: 'a', y: [10, 20] },
    { id: 'b', y: [5, 5] },
    { id: 'c', y: [1, 1] },
  ]

  it('без флага границ полос нет', () => {
    const data = normalizeChartData(series)

    expect(data.series[0]!.points[0]!.stackTop).toBeUndefined()
  })

  it('первая серия внизу, каждая следующая ложится на сумму предыдущих', () => {
    const data = normalizeChartData(series, { stacked: true })
    const tops = data.series.map(item => item.points[0]!.stackTop)

    expect(tops).toEqual([10, 15, 16])
    expect(data.series[2]!.points[0]!.stackBase).toBe(15)
  })

  it('собственное значение точки стек не трогает', () => {
    // Тултип обязан говорить «пять», а не «пятнадцать, потому что снизу десять».
    const data = normalizeChartData(series, { stacked: true })

    expect(data.series[1]!.points[0]!.y).toBe(5)
  })

  it('ось считается по вершинам полос, а не по значениям', () => {
    const data = normalizeChartData(series, { stacked: true })

    expect(data.yDomain[1]).toBeGreaterThanOrEqual(26)
    expect(data.yDomain[0]).toBe(0)
  })

  it('скрытая серия из стека выпадает — соседи опускаются', () => {
    const withHidden = normalizeChartData(
      [{ id: 'a', y: [10] }, { id: 'b', y: [5], hidden: true }, { id: 'c', y: [1] }],
      { stacked: true },
    )

    expect(withHidden.series[2]!.points[0]!.stackBase).toBe(10)
  })

  it('пропуск ничего не добавляет к сумме и рвёт собственную полосу', () => {
    const data = normalizeChartData(
      [{ id: 'a', y: [10, null] }, { id: 'b', y: [5, 5] }],
      { stacked: true },
    )

    expect(data.series[0]!.points[1]!.stackTop).toBeUndefined()
    expect(data.series[1]!.points[1]!.stackBase).toBe(0)
  })
})

describe('normalizeChartData: закреплённые значения домена', () => {
  const series = [{ id: 'a', y: [0.02, 0.03, 0.031] }]

  it('без закрепления порог за пределами данных домен не растягивает', () => {
    expect(normalizeChartData(series).yDomain[1]).toBeCloseTo(0.031)
  })

  it('закреплённое значение входит в домен вместе с данными', () => {
    const data = normalizeChartData(series, { includeYValues: [1] })

    expect(data.yDomain[1]).toBe(1)
    expect(data.yDomain[0]).toBeCloseTo(0.02)
  })

  it('закрепление складывается с `includeZero`, а не отменяет его', () => {
    const data = normalizeChartData(series, { includeZero: true, includeYValues: [1] })

    expect(data.yDomain).toEqual([0, 1])
  })

  it('`yDomain` сильнее закрепления: явная граница остаётся явной', () => {
    const data = normalizeChartData(series, { includeYValues: [1], yDomain: [null, 0.05] })

    expect(data.yDomain[1]).toBe(0.05)
  })

  it('закрепление по X расширяет линейную ось', () => {
    const data = normalizeChartData([{ id: 'a', x: [0, 1, 2], y: [1, 2, 3] }], { includeXValues: [10] })

    expect(data.xDomain).toEqual([0, 10])
  })

  it('у категориальной оси закреплять нечего — домен остаётся по категориям', () => {
    // Домен `band` это `[0, n−1]`: расширить его значило бы дорисовать
    // категорию, которой в данных нет.
    const data = normalizeChartData([{ id: 'a', data: [{ x: 'янв', y: 1 }, { x: 'фев', y: 2 }] }], {
      includeXValues: [10],
    })

    expect(data.xDomain).toEqual([0, 1])
  })

  it('пустой массив закреплений ничего не меняет', () => {
    expect(normalizeChartData(series, { includeYValues: [] }).yDomain)
      .toEqual(normalizeChartData(series).yDomain)
  })

  it('закрепление держит домен, когда данных нет вовсе', () => {
    const data = normalizeChartData([], { includeYValues: [4, 8] })

    expect(data.yDomain).toEqual([4, 8])
  })
})

describe('normalizeChartData: вторая ось значений', () => {
  const series = [
    { id: 'mrr', label: 'MRR', y: [40000, 42000], axis: 'right' as const },
    { id: 'active', label: 'Активные', y: [120, 130] },
  ]

  it('`dualAxis: false` кладёт все серии на левую ось и второго домена не заводит', () => {
    // Поле в данных само по себе вторую ось не включает: две оси позволяют
    // подогнать любые два ряда под видимую корреляцию.
    const data = normalizeChartData(series)

    expect(data.series.map(item => item.axis)).toEqual(['left', 'left'])
    expect(data.yDomainRight).toBeUndefined()
  })

  it('`dualAxis: false` даёт домен, неотличимый от того, что был до второй оси', () => {
    const data = normalizeChartData(series)

    expect(data.yDomain).toEqual([120, 42000])
  })

  it('домены считаются раздельно, каждый по своим сериям', () => {
    const data = normalizeChartData(series, { dualAxis: true })

    expect(data.yDomain).toEqual([120, 130])
    expect(data.yDomainRight).toEqual([40000, 42000])
  })

  it('скрытие серии трогает только свою ось', () => {
    const data = normalizeChartData(
      [...series, { id: 'new', label: 'Новые', y: [500, 600] }],
      { dualAxis: true },
    )
    const hidden = normalizeChartData(
      [...series, { id: 'new', label: 'Новые', y: [500, 600], hidden: true }],
      { dualAxis: true },
    )

    expect(hidden.yDomain).not.toEqual(data.yDomain)
    expect(hidden.yDomainRight).toEqual(data.yDomainRight)
  })

  it('второго домена нет, пока нет ни одной серии на правой оси', () => {
    expect(normalizeChartData([{ id: 'a', y: [1, 2] }], { dualAxis: true }).yDomainRight).toBeUndefined()
  })

  it('стек не пересекает ось: у каждой свои итоги', () => {
    const data = normalizeChartData([
      { id: 'a', y: [10] },
      { id: 'b', y: [5] },
      { id: 'c', y: [1000], axis: 'right' as const },
    ], { dualAxis: true, stacked: true })

    expect(data.series[1]!.points[0]!.stackBase).toBe(10)
    // Правая серия начинает свою стопку с нуля, а не с суммы левых.
    expect(data.series[2]!.points[0]!.stackBase).toBe(0)
  })

  it('`yDomainRight` перекрывает границу правой оси, не трогая левую', () => {
    const data = normalizeChartData(series, { dualAxis: true, yDomainRight: [0, null] })

    expect(data.yDomainRight?.[0]).toBe(0)
    expect(data.yDomain[0]).toBe(120)
  })

  it('`includeZero` применяется к обеим осям', () => {
    const data = normalizeChartData(series, { dualAxis: true, includeZero: true })

    expect(data.yDomain[0]).toBe(0)
    expect(data.yDomainRight?.[0]).toBe(0)
  })
})
