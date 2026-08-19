import { describe, expect, it } from 'vitest'

import { decimatePoints, decimateSeriesGroup, decimationBudget, lttbIndices } from '../chartDecimate'
import type { NormalizedPoint, NormalizedSeries } from '../chartModel'
import { normalizeChartData } from '../chartModel'
import { segmentsOf } from '../chartPath'

function points(values: readonly (number | null)[], xOf: (index: number) => number = index => index): NormalizedPoint[] {
  return values.map((y, index) => ({ x: xOf(index), y, sourceIndex: index, raw: xOf(index) }))
}

/** Пила с одиночным выбросом: на ней видно разницу между LTTB и равномерным шагом. */
function sawWithSpike(total: number, spikeAt: number): NormalizedPoint[] {
  return points(Array.from({ length: total }, (_, index) => (index === spikeAt ? 1000 : index % 2)))
}

describe('decimationBudget', () => {
  const base = { mode: 'auto' as const, kind: 'linear' as const, plotWidth: 640, total: 10_000 }

  it('категориальная шкала не прореживается никогда', () => {
    // Выброшенная категория оставила бы на оси подпись, под которой пусто.
    expect(decimationBudget({ ...base, kind: 'band' })).toBeNull()
    expect(decimationBudget({ ...base, kind: 'band', mode: 'always' })).toBeNull()
  })

  it('`never` выключает, `auto` молчит на коротком ряде', () => {
    expect(decimationBudget({ ...base, mode: 'never' })).toBeNull()
    expect(decimationBudget({ ...base, total: 100 })).toBeNull()
  })

  it('`always` даёт бюджет и на коротком ряде', () => {
    expect(decimationBudget({ ...base, mode: 'always', total: 100 })).toBeGreaterThan(0)
  })

  it('нулевая ширина — рисуем всё, а не ничего', () => {
    // SSR, скрытая вкладка, jsdom: замера ещё нет.
    expect(decimationBudget({ ...base, plotWidth: 0 })).toBeNull()
  })

  it('ширина квантуется — путь не дёргается на каждом пикселе ресайза', () => {
    expect(decimationBudget({ ...base, plotWidth: 600 })).toBe(decimationBudget({ ...base, plotWidth: 610 }))
  })

  it('явный `maxPoints` сильнее ширины', () => {
    expect(decimationBudget({ ...base, maxPoints: 500 })).toBe(500)
  })
})

describe('lttbIndices', () => {
  it('короткий ряд отдаётся целиком', () => {
    expect(lttbIndices(points([1, 2, 3]), { maxPoints: 10 })).toEqual([0, 1, 2])
  })

  it('концы ряда сохраняются', () => {
    const input = sawWithSpike(1000, 507)
    const kept = lttbIndices(input, { maxPoints: 50 })

    expect(kept[0]).toBe(0)
    expect(kept.at(-1)).toBe(999)
  })

  it('индексы строго возрастают', () => {
    const kept = lttbIndices(sawWithSpike(1000, 507), { maxPoints: 50 })

    expect(kept.every((value, index) => index === 0 || value > kept[index - 1]!)).toBe(true)
  })

  it('одиночный выброс не теряется', () => {
    // Главный тест модуля: равномерный страйд прошёл бы все остальные проверки,
    // а этот — нет, потому что попал бы на пик только случайно.
    expect(lttbIndices(sawWithSpike(1000, 507), { maxPoints: 50 })).toContain(507)
  })

  it('выбор точек не зависит от единиц оси X', () => {
    // Инвариант, а не проверка нормировки: делители входят в площадь общим
    // множителем и порядок сравнения не меняют. Тест держит другое — что смена
    // единиц (индексы против epoch) не сдвигает выбор.
    const values = Array.from({ length: 500 }, (_, index) => (index === 257 ? 1000 : index % 2))
    const byIndex = lttbIndices(points(values), { maxPoints: 40 })
    const asEpoch = lttbIndices(points(values, index => 1_700_000_000_000 + index * 86_400_000), { maxPoints: 40 })

    expect(asEpoch).toEqual(byIndex)
    expect(byIndex).toContain(257)
  })
})

describe('decimatePoints', () => {
  it('короткий ряд возвращается той же ссылкой', () => {
    const input = points([1, 2, 3])

    expect(decimatePoints(input, { maxPoints: 10 })).toBe(input)
  })

  it('точки результата — те же объекты, а не копии', () => {
    const input = sawWithSpike(1000, 507)
    const kept = decimatePoints(input, { maxPoints: 50 })

    expect(kept.every(point => input.includes(point))).toBe(true)
    expect(kept.find(point => point.y === 1000)).toBe(input[507])
  })

  it('плато не выдумывает значений', () => {
    const kept = decimatePoints(points(Array.from<number>({ length: 500 }).fill(7)), { maxPoints: 40 })

    expect(kept.every(point => point.y === 7)).toBe(true)
  })

  it('разрыв переживает прореживание', () => {
    const values = Array.from({ length: 600 }, (_, index) => (index === 300 ? null : index % 5))
    const input = points(values)
    const kept = decimatePoints(input, { maxPoints: 60 })

    // Столько же сегментов, сколько было: линия не соединится через пропуск.
    expect(segmentsOf(kept).length).toBe(segmentsOf(input).length)
    expect(kept.filter(point => point.y === null).length).toBe(1)
  })
})

describe('decimateSeriesGroup', () => {
  function group(): readonly NormalizedSeries[] {
    return normalizeChartData([
      { id: 'a', y: Array.from({ length: 800 }, (_, index) => index % 7) },
      { id: 'b', y: Array.from({ length: 800 }, (_, index) => index % 5) },
    ], { stacked: true }).series
  }

  it('при общем наборе абсцисс серии совпадают по x', () => {
    // Иначе полосы стека разойдутся швами: низ верхней интерполируется по одним
    // точкам, верх нижней — по другим.
    const [first, second] = decimateSeriesGroup(group(), { maxPoints: 60, sharedX: true })

    expect(second!.points.map(point => point.x)).toEqual(first!.points.map(point => point.x))
  })

  it('границы стека не тронуты', () => {
    const [first] = decimateSeriesGroup(group(), { maxPoints: 60, sharedX: true })

    expect(first!.points.every(point => point.stackTop !== undefined)).toBe(true)
  })

  it('без `sharedX` каждая серия прореживается сама', () => {
    const result = decimateSeriesGroup(group(), { maxPoints: 60 })

    expect(result[0]!.points.length).toBeLessThan(800)
  })
})
