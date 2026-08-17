import { describe, expect, it } from 'vitest'

import { normalizeChartData } from '../chartModel'
import {
  type GrChartReference,
  normalizeReferences,
  referenceDomainValues,
  referenceMarks,
  referenceValueToNumber,
} from '../chartReference'
import { linearScale, timeScale } from '../chartScale'

const plot = { x: 40, y: 10, width: 200, height: 100 }

const linearContext = {
  kind: 'linear' as const,
  xDomain: [0, 10] as const,
  yDomain: [0, 100] as const,
}

describe('referenceValueToNumber', () => {
  it('`Date` и ISO-строка на временной оси дают одну позицию', () => {
    // Иначе один и тот же порог вставал бы в разные места в зависимости от
    // того, в каком виде его отдал бэкенд.
    const moment = new Date('2026-08-15T00:00:00.000Z')

    expect(referenceValueToNumber('2026-08-15T00:00:00.000Z', 'x', 'time'))
      .toBe(referenceValueToNumber(moment, 'x', 'time'))
  })

  it('имя категории превращается в её индекс', () => {
    expect(referenceValueToNumber('фев', 'x', 'band', ['янв', 'фев', 'мар'])).toBe(1)
  })

  it('категория, которой нет, — это не нулевая категория', () => {
    expect(referenceValueToNumber('апр', 'x', 'band', ['янв', 'фев'])).toBeNull()
  })

  it('неразбираемое значение даёт `null`, а не `NaN`', () => {
    expect(referenceValueToNumber('порог', 'y', 'linear')).toBeNull()
    expect(referenceValueToNumber(Number.POSITIVE_INFINITY, 'y', 'linear')).toBeNull()
  })
})

describe('normalizeReferences', () => {
  it('одно значение — линия, пара — полоса', () => {
    const result = normalizeReferences(
      [{ axis: 'y', value: 50 }, { axis: 'y', value: [40, 60] }],
      linearContext,
    )

    expect(result.map(item => item.band)).toEqual([false, true])
  })

  it('порядок в паре не важен — полоса нормализуется', () => {
    const [straight] = normalizeReferences([{ axis: 'y', value: [40, 60] }], linearContext)
    const [reversed] = normalizeReferences([{ axis: 'y', value: [60, 40] }], linearContext)

    expect(reversed).toEqual(straight)
  })

  it('опора за пределами домена помечается, но не выбрасывается', () => {
    const [reference] = normalizeReferences([{ axis: 'y', value: 1000 }], linearContext)

    expect(reference!.outside).toBe(true)
  })

  it('полоса, задевающая домен краем, пересечением считается', () => {
    const [reference] = normalizeReferences([{ axis: 'y', value: [90, 1000] }], linearContext)

    expect(reference!.outside).toBe(false)
  })

  it('полоса с неразобранным концом отбрасывается целиком', () => {
    // Дорисовать её от края области значило бы придумать границу.
    expect(normalizeReferences([{ axis: 'y', value: [40, 'порог'] }], linearContext)).toEqual([])
  })

  it('индекс во входе сохраняется — по нему опора адресуется в описании', () => {
    const references: GrChartReference[] = [
      { axis: 'y', value: 'мусор' },
      { axis: 'y', value: 50 },
    ]

    expect(normalizeReferences(references, linearContext)[0]!.index).toBe(1)
  })

  it('подпись прижимается к концу у горизонтальной опоры и к началу у вертикальной', () => {
    const [horizontal] = normalizeReferences([{ axis: 'y', value: 50 }], linearContext)
    const [vertical] = normalizeReferences([{ axis: 'x', value: 5 }], linearContext)

    expect(horizontal!.labelAnchor).toBe('end')
    expect(vertical!.labelAnchor).toBe('start')
  })
})

describe('referenceDomainValues', () => {
  it('значения расходятся по осям', () => {
    const values = referenceDomainValues(
      [{ axis: 'y', value: 1 }, { axis: 'x', value: [2, 3] }],
      'linear',
    )

    expect(values).toEqual({ x: [2, 3], y: [1] })
  })

  it('опора по категориальной оси домен не расширяет', () => {
    expect(referenceDomainValues([{ axis: 'x', value: 'фев' }], 'band')).toEqual({ x: [], y: [] })
  })

  it('домен расширяется ровно на опору и вместе с данными', () => {
    const series = [{ id: 'a', y: [0.02, 0.031] }]
    const { y } = referenceDomainValues([{ axis: 'y', value: 1 }], 'linear')

    expect(normalizeChartData(series, { includeYValues: y }).yDomain).toEqual([0.02, 1])
    expect(normalizeChartData(series).yDomain[1]).toBeCloseTo(0.031)
  })
})

describe('referenceMarks', () => {
  const options = {
    plot,
    xScale: linearScale([0, 10], [plot.x, plot.x + plot.width]),
    yScale: linearScale([0, 100], [plot.y + plot.height, plot.y]),
    fontSizePx: 12,
  }

  it('опора вне домена не рисуется', () => {
    const references = normalizeReferences([{ axis: 'y', value: 1000 }], linearContext)

    expect(referenceMarks(references, options)).toEqual([])
  })

  it('горизонтальная линия тянется на всю ширину области и имеет нулевую высоту', () => {
    const [mark] = referenceMarks(normalizeReferences([{ axis: 'y', value: 50 }], linearContext), options)

    expect(mark!.x).toBe(plot.x)
    expect(mark!.width).toBe(plot.width)
    expect(mark!.height).toBe(0)
    expect(mark!.y).toBe(plot.y + plot.height / 2)
  })

  it('полоса, выходящая за область, зажимается по ней, а не рисуется мимо', () => {
    const [mark] = referenceMarks(normalizeReferences([{ axis: 'y', value: [50, 1000] }], linearContext), options)

    expect(mark!.y).toBe(plot.y)
    expect(mark!.height).toBe(plot.height / 2)
  })

  it('подпись не уезжает выше верхнего края области', () => {
    const [mark] = referenceMarks(normalizeReferences([{ axis: 'y', value: 100 }], linearContext), options)

    expect(mark!.labelY).toBeGreaterThanOrEqual(plot.y)
  })

  it('вертикальная опора занимает всю высоту, подпись центрируется по линии', () => {
    const [mark] = referenceMarks(normalizeReferences([{ axis: 'x', value: 5 }], linearContext), options)

    expect(mark!.height).toBe(plot.height)
    expect(mark!.width).toBe(0)
    expect(mark!.labelX).toBe(plot.x + plot.width / 2)
    expect(mark!.textAnchor).toBe('middle')
  })

  it('на временной оси `Date` и ISO-строка встают в один пиксель', () => {
    const from = Date.UTC(2026, 0, 1)
    const to = Date.UTC(2026, 11, 31)
    const context = { kind: 'time' as const, xDomain: [from, to] as const, yDomain: [0, 100] as const }
    const timeOptions = { ...options, xScale: timeScale([from, to], [plot.x, plot.x + plot.width]) }

    const byDate = referenceMarks(
      normalizeReferences([{ axis: 'x', value: new Date('2026-06-15T00:00:00.000Z') }], context),
      timeOptions,
    )
    const byString = referenceMarks(
      normalizeReferences([{ axis: 'x', value: '2026-06-15T00:00:00.000Z' }], context),
      timeOptions,
    )

    expect(byString[0]!.x).toBe(byDate[0]!.x)
  })

  it('пустой вход даёт пустой список, а не падение', () => {
    expect(referenceMarks([], options)).toEqual([])
  })
})
