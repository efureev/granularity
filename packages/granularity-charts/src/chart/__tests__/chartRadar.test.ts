import { describe, expect, it } from 'vitest'

import { polarPoint } from '../chartArc'
import { normalizeChartData } from '../chartModel'
import {
  alignSeriesToAxes,
  nearestAxis,
  perAxisMaxima,
  radarAreaPath,
  radarAxisAngles,
  radarLabelAnchor,
  radarLinePath,
  radarRingPath,
  radarSegments,
} from '../chartRadar'

const TAU = Math.PI * 2

describe('radarAxisAngles', () => {
  it('спицы равномерны и первая стоит под стартовым углом', () => {
    const angles = radarAxisAngles(4)

    expect(angles).toHaveLength(4)
    expect(angles[0]).toBe(0)
    expect(angles[1]).toBeCloseTo(TAU / 4, 12)
    expect(angles[3]).toBeCloseTo((TAU * 3) / 4, 12)
  })

  it('стартовый угол сдвигает всю паутину', () => {
    expect(radarAxisAngles(3, Math.PI)[0]).toBe(Math.PI)
  })

  it('вырожденный вход не даёт деления на ноль', () => {
    expect(radarAxisAngles(0)).toEqual([])
    expect(radarAxisAngles(1)).toEqual([0])
  })
})

describe('alignSeriesToAxes', () => {
  it('серия без оси получает на ней пропуск, а не выпадает', () => {
    const aligned = alignSeriesToAxes([
      { id: 'a', x: ['Скорость', 'Цена'], y: [1, 2] },
      { id: 'b', x: ['Цена', 'Поддержка'], y: [3, 4] },
    ])

    expect(aligned[0]!.x).toEqual(['Скорость', 'Цена', 'Поддержка'])
    expect(aligned[0]!.y).toEqual([1, 2, null])
    expect(aligned[1]!.y).toEqual([null, 3, 4])
  })

  it('порядок осей — порядок первого появления', () => {
    const aligned = alignSeriesToAxes([
      { id: 'a', x: ['Б', 'А'], y: [1, 2] },
      { id: 'b', x: ['В'], y: [3] },
    ])

    expect(aligned[0]!.x).toEqual(['Б', 'А', 'В'])
  })

  it('объектный и колоночный вход дают одно и то же', () => {
    const columns = alignSeriesToAxes([{ id: 'a', x: ['А', 'Б'], y: [1, 2] }])
    const objects = alignSeriesToAxes([{ id: 'a', data: [{ x: 'А', y: 1 }, { x: 'Б', y: 2 }] }])

    expect(objects[0]!.x).toEqual(columns[0]!.x)
    expect(objects[0]!.y).toEqual(columns[0]!.y)
    // `data` снимается: иначе нормализация возьмёт её и проигнорирует выравнивание.
    expect(objects[0]!.data).toBeUndefined()
  })

  /**
   * Ради чего всё и затевалось: скрытие серии не должно уносить спицу. Без
   * выравнивания `positions` считаются по видимым сериям, и паутина
   * проворачивается.
   */
  it('скрытие серии не меняет числа осей', () => {
    const input = [
      { id: 'a', x: ['А', 'Б'], y: [1, 2] },
      { id: 'b', x: ['А', 'Б', 'В'], y: [3, 4, 5] },
    ]

    const raw = normalizeChartData(input.map((s, i) => (i === 1 ? { ...s, hidden: true } : s)), { kind: 'band' })
    const aligned = normalizeChartData(
      alignSeriesToAxes(input).map((s, i) => (i === 1 ? { ...s, hidden: true } : s)),
      { kind: 'band' },
    )

    expect(raw.positions).toHaveLength(2)
    expect(aligned.positions).toHaveLength(3)
  })
})

describe('perAxisMaxima', () => {
  const data = normalizeChartData([
    { id: 'a', x: ['А', 'Б', 'В'], y: [10, 0, null] },
    { id: 'b', x: ['А', 'Б', 'В'], y: [4, 0, null] },
  ], { kind: 'band' })

  it('максимум берётся по видимым сериям на каждой оси', () => {
    expect(perAxisMaxima(data.series, data.positions)[0]).toBe(10)
  })

  it('ось без положительных значений получает единицу, а не ноль', () => {
    // Домен `[0, 0]` дал бы шкалу без размаха: все нули сели бы на середину
    // радиуса и нарисовали бодрый многоугольник.
    const maxima = perAxisMaxima(data.series, data.positions)

    expect(maxima[1]).toBe(1)
    expect(maxima[2]).toBe(1)
  })

  it('скрытая серия в максимум не входит', () => {
    const hidden = normalizeChartData([
      { id: 'a', x: ['А'], y: [4] },
      { id: 'b', x: ['А'], y: [99], hidden: true },
    ], { kind: 'band' })

    expect(perAxisMaxima(hidden.series, hidden.positions)[0]).toBe(4)
  })
})

describe('radarSegments', () => {
  const p = (x: number, y: number) => ({ x, y })

  it('ряд без пропусков — один замкнутый кусок', () => {
    const result = radarSegments([p(0, 0), p(1, 1), p(2, 2)])

    expect(result.closed).toBe(true)
    expect(result.segments).toHaveLength(1)
    expect(result.segments[0]).toHaveLength(3)
  })

  it('кусок на шве не распадается надвое', () => {
    // Пропуск в середине: обход начинается сразу после него, поэтому вершины
    // «конец → начало» остаются одним куском.
    const result = radarSegments([p(0, 0), null, p(2, 2), p(3, 3)])

    expect(result.closed).toBe(false)
    expect(result.segments).toHaveLength(1)
    expect(result.segments[0]).toEqual([p(2, 2), p(3, 3), p(0, 0)])
  })

  it('пропуск на нулевой позиции не рвёт кусок', () => {
    const result = radarSegments([null, p(1, 1), p(2, 2), p(3, 3)])

    expect(result.segments).toHaveLength(1)
    expect(result.segments[0]).toHaveLength(3)
  })

  it('два пропуска дают два куска', () => {
    const result = radarSegments([p(0, 0), null, p(2, 2), null])

    expect(result.segments).toHaveLength(2)
    expect(result.closed).toBe(false)
  })

  it('пустой и полностью пустой вход кусков не дают', () => {
    expect(radarSegments([])).toEqual({ segments: [], closed: false })
    expect(radarSegments([null, null])).toEqual({ segments: [], closed: false })
  })
})

describe('radarLinePath и radarAreaPath', () => {
  const ring = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 5, y: 10 }]

  it('замкнутый контур заканчивается Z, рваный — нет', () => {
    expect(radarLinePath([ring], true)).toContain('Z')
    expect(radarLinePath([ring], false)).not.toContain('Z')
  })

  it('кусок из одной вершины линией не рисуется', () => {
    expect(radarLinePath([[{ x: 0, y: 0 }]], false)).toBe('')
  })

  it('заливка отменяется целиком, если в контуре есть разрыв', () => {
    // Незамкнутый путь SVG замкнёт сам и нарисует площадь через пропуск.
    expect(radarAreaPath([...ring, null])).toBe('')
    expect(radarAreaPath(ring)).toContain('Z')
  })

  it('меньше трёх вершин площади не образуют', () => {
    expect(radarAreaPath([{ x: 0, y: 0 }, { x: 1, y: 1 }])).toBe('')
  })
})

describe('radarRingPath', () => {
  it('кольцо — замкнутый многоугольник по числу спиц', () => {
    const d = radarRingPath(50, 50, 40, radarAxisAngles(5))

    expect(d.match(/L /g)).toHaveLength(4)
    expect(d.endsWith('Z')).toBe(true)
  })

  it('вырожденные параметры дают пустой путь, а не NaN', () => {
    expect(radarRingPath(50, 50, 0, radarAxisAngles(5))).toBe('')
    expect(radarRingPath(50, 50, 40, radarAxisAngles(2))).toBe('')
  })
})

describe('nearestAxis', () => {
  const bounds = { minRadius: 8, maxRadius: 100 }

  it('точка на спице отдаёт её индекс', () => {
    const angles = radarAxisAngles(4)

    angles.forEach((angle, index) => {
      const point = polarPoint(0, 0, 50, angle)

      expect(nearestAxis(0, 0, point.x, point.y, 4, 0, bounds)).toBe(index)
    })
  })

  it('сектор, перешагнувший через двенадцать часов, не даёт индекса за пределами набора', () => {
    // Без остатка по модулю `Math.round` вернул бы здесь `count`.
    const justBeforeTwelve = polarPoint(0, 0, 50, TAU - 0.01)

    expect(nearestAxis(0, 0, justBeforeTwelve.x, justBeforeTwelve.y, 5, 0, bounds)).toBe(0)
  })

  it('стартовый угол учитывается', () => {
    const shifted = polarPoint(0, 0, 50, Math.PI)

    expect(nearestAxis(0, 0, shifted.x, shifted.y, 4, Math.PI, bounds)).toBe(0)
  })

  it('снаружи кольца и в мёртвой зоне центра попадания нет', () => {
    expect(nearestAxis(0, 0, 0, -200, 4, 0, bounds)).toBe(-1)
    expect(nearestAxis(0, 0, 1, 1, 4, 0, bounds)).toBe(-1)
  })

  it('между осями не пусто: любая точка кольца отдаёт ось', () => {
    // У радара между спицами натянут контур, и «промах» там читался бы как поломка.
    for (let angle = 0; angle < TAU; angle += 0.05) {
      const point = polarPoint(0, 0, 50, angle)

      expect(nearestAxis(0, 0, point.x, point.y, 6, 0, bounds)).toBeGreaterThanOrEqual(0)
    }
  })

  it('осей нет — попадания нет', () => {
    expect(nearestAxis(0, 0, 10, 10, 0, 0, bounds)).toBe(-1)
  })
})

describe('radarLabelAnchor', () => {
  it('сверху и снизу подпись центрируется, по бокам прижимается', () => {
    expect(radarLabelAnchor(0)).toBe('middle')
    expect(radarLabelAnchor(Math.PI)).toBe('middle')
    expect(radarLabelAnchor(Math.PI / 2)).toBe('start')
    expect(radarLabelAnchor((Math.PI * 3) / 2)).toBe('end')
  })

  it('допуск у вертикали есть: иначе якорь прыгает от округления', () => {
    expect(radarLabelAnchor(0.01)).toBe('middle')
  })
})
