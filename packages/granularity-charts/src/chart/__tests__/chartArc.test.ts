import { describe, expect, it } from 'vitest'

import { angleOfPoint, arcCentroid, arcPath, pieSlices, polarPoint, sliceAtPoint } from '../chartArc'

const TAU = Math.PI * 2

describe('pieSlices', () => {
  it('доли в сумме дают полный круг', () => {
    const slices = pieSlices([1, 2, 3, 4])

    expect(slices).toHaveLength(4)
    expect(slices.reduce((sum, slice) => sum + slice.share, 0)).toBeCloseTo(1, 12)
    expect(slices.at(-1)!.endAngle).toBeCloseTo(TAU, 12)
  })

  it('доли идут встык, без зазоров и нахлёстов', () => {
    const slices = pieSlices([5, 1, 4])

    for (let i = 1; i < slices.length; i++)
      expect(slices[i]!.startAngle).toBe(slices[i - 1]!.endAngle)
  })

  it('пропуски, нули и отрицательные значения отбрасываются', () => {
    // «Минус три» доли круга не бывает: взять по модулю значило бы нарисовать
    // данные, которых нет.
    const slices = pieSlices([10, null, 0, -5, 10])

    expect(slices.map(slice => slice.sourceIndex)).toEqual([0, 4])
    expect(slices.every(slice => slice.share === 0.5)).toBe(true)
  })

  it('sourceIndex остаётся индексом входа, а не позицией после фильтрации', () => {
    expect(pieSlices([null, 7]).map(slice => slice.sourceIndex)).toEqual([1])
  })

  it('пустой и нулевой вход не дают долей', () => {
    expect(pieSlices([])).toEqual([])
    expect(pieSlices([0, null, -1])).toEqual([])
  })

  it('стартовый угол сдвигает весь круг', () => {
    const shifted = pieSlices([1, 1], { startAngle: Math.PI })

    expect(shifted[0]!.startAngle).toBe(Math.PI)
    expect(shifted.at(-1)!.endAngle).toBeCloseTo(Math.PI + TAU, 12)
  })
})

describe('polarPoint', () => {
  it('ноль — вверху, угол растёт по часовой', () => {
    expect(polarPoint(0, 0, 10, 0)).toEqual({ x: 0, y: -10 })

    const right = polarPoint(0, 0, 10, Math.PI / 2)

    expect(right.x).toBeCloseTo(10, 9)
    expect(right.y).toBeCloseTo(0, 9)
  })
})

describe('arcPath', () => {
  it('сектор идёт из центра, кольцо — нет', () => {
    const wedge = arcPath(50, 50, 40, 0, 0, Math.PI / 2)
    const ring = arcPath(50, 50, 40, 20, 0, Math.PI / 2)

    expect(wedge).toContain('L 50 50')
    expect(ring).not.toContain('L 50 50')
    expect(ring.match(/A /g)).toHaveLength(2)
  })

  it('полный круг рисуется двумя дугами: одна в 360° не рисует ничего', () => {
    const circle = arcPath(50, 50, 40, 0, 0, TAU)

    expect(circle.match(/A /g)).toHaveLength(2)
    expect(circle).not.toContain('NaN')
  })

  it('полное кольцо — четыре дуги и два подпути', () => {
    const ring = arcPath(50, 50, 40, 20, 0, TAU)

    expect(ring.match(/A /g)).toHaveLength(4)
    expect(ring.match(/M /g)).toHaveLength(2)
  })

  it('большая дуга помечается флагом', () => {
    const small = arcPath(50, 50, 40, 0, 0, Math.PI / 3)
    const large = arcPath(50, 50, 40, 0, 0, Math.PI * 1.5)

    expect(small).toMatch(/A 40 40 0 0 1/)
    expect(large).toMatch(/A 40 40 0 1 1/)
  })

  it('вырожденные параметры дают пустой путь, а не NaN', () => {
    expect(arcPath(50, 50, 40, 0, 1, 1)).toBe('')
    expect(arcPath(50, 50, 0, 0, 0, Math.PI)).toBe('')
  })
})

describe('arcCentroid', () => {
  it('лежит между радиусами и внутри своего угла', () => {
    const centroid = arcCentroid(0, 0, 40, 20, 0, Math.PI / 2)
    const distance = Math.hypot(centroid.x, centroid.y)

    expect(distance).toBeCloseTo(30, 9)
    expect(angleOfPoint(0, 0, centroid.x, centroid.y)).toBeCloseTo(Math.PI / 4, 9)
  })
})

describe('sliceAtPoint', () => {
  const slices = pieSlices([1, 1, 1, 1])

  it('находит долю по углу, а не по абсциссе', () => {
    // Вверх — первая доля, вправо — вторая: круг читается по часовой.
    expect(sliceAtPoint(slices, 0, 0, 40, 0, 0, -30)).toBe(0)
    expect(sliceAtPoint(slices, 0, 0, 40, 0, 30, 0)).toBe(1)
    expect(sliceAtPoint(slices, 0, 0, 40, 0, 0, 30)).toBe(2)
    expect(sliceAtPoint(slices, 0, 0, 40, 0, -30, 0)).toBe(3)
  })

  it('вне круга попадания нет', () => {
    expect(sliceAtPoint(slices, 0, 0, 40, 0, 0, -80)).toBe(-1)
  })

  it('в дырке бублика попадания нет — «ближайшая доля» там означала бы выбор наугад', () => {
    expect(sliceAtPoint(slices, 0, 0, 40, 20, 0, -5)).toBe(-1)
    expect(sliceAtPoint(slices, 0, 0, 40, 20, 0, -30)).toBe(0)
  })

  it('доля, перешагнувшая через двенадцать часов, ловится целиком', () => {
    const shifted = pieSlices([1], { startAngle: Math.PI })

    expect(sliceAtPoint(shifted, 0, 0, 40, 0, 0, -30)).toBe(0)
    expect(sliceAtPoint(shifted, 0, 0, 40, 0, 30, 0)).toBe(0)
  })
})
