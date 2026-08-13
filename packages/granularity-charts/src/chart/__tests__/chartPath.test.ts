import { describe, expect, it } from 'vitest'

import { areaPath, dashArrayFor, GR_CHART_SHAPES, linePath, segmentsOf, symbolPath } from '../chartPath'

describe('segmentsOf', () => {
  it('пропуск в середине рвёт ряд на два куска', () => {
    const segments = segmentsOf([
      { x: 0, y: 1 },
      { x: 1, y: 2 },
      { x: 2, y: null },
      { x: 3, y: 4 },
    ])

    expect(segments).toHaveLength(2)
    expect(segments[0]).toHaveLength(2)
    expect(segments[1]).toHaveLength(1)
  })

  it('пропуски по краям не дают пустых кусков', () => {
    const segments = segmentsOf([
      { x: 0, y: null },
      { x: 1, y: 5 },
      { x: 2, y: null },
    ])

    expect(segments).toEqual([[{ x: 1, y: 5 }]])
  })

  it('нечисловое значение считается пропуском', () => {
    expect(segmentsOf([{ x: 0, y: Number.NaN }, { x: 1, y: 1 }])).toEqual([[{ x: 1, y: 1 }]])
  })

  it('ряд целиком из пропусков не даёт ни одного куска', () => {
    expect(segmentsOf([{ x: 0, y: null }, { x: 1, y: null }])).toEqual([])
  })
})

describe('linePath', () => {
  it('линейная кривая — M и L', () => {
    expect(linePath([{ x: 0, y: 0 }, { x: 10, y: 5 }])).toBe('M 0 0 L 10 5')
  })

  it('одна точка линией не рисуется — её показывает маркер', () => {
    expect(linePath([{ x: 3, y: 3 }])).toBe('')
  })

  it('всё пропуски — пустая строка, а не «M NaN NaN»', () => {
    expect(linePath([{ x: 0, y: null }])).toBe('')
  })

  it('разрыв даёт два независимых подпути', () => {
    const d = linePath([
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: null },
      { x: 3, y: 3 },
      { x: 4, y: 4 },
    ])

    expect(d.match(/M /g)).toHaveLength(2)
  })

  it('step ведёт линию по горизонтали до следующего x', () => {
    expect(linePath([{ x: 0, y: 0 }, { x: 10, y: 5 }], 'step')).toBe('M 0 0 L 10 0 L 10 5')
  })

  it('smooth не выбрасывает кривую за диапазон соседних значений', () => {
    // Резкий выброс в середине — классический случай, где Catmull-Rom рисует
    // максимум, которого в данных нет.
    const points = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 100 }, { x: 3, y: 100 }]
    const d = linePath(points, 'smooth')
    const numbers = d.match(/-?\d+(?:\.\d+)?/g)!.map(Number)

    expect(Math.min(...numbers)).toBeGreaterThanOrEqual(0)
    expect(Math.max(...numbers)).toBeLessThanOrEqual(100)
  })

  it('smooth на монотонном ряде остаётся монотонным', () => {
    const d = linePath([{ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2 }], 'smooth')

    expect(d.startsWith('M 0 0')).toBe(true)
    expect(d).toContain('C ')
  })
})

describe('areaPath', () => {
  it('замыкается по базовой линии', () => {
    const d = areaPath([{ x: 0, y: 10 }, { x: 10, y: 20 }], 100)

    expect(d).toBe('M 0 10 L 10 20 L 10 100 L 0 100 Z')
  })

  it('каждый кусок замыкается отдельно — разрыв не заливается', () => {
    const d = areaPath([
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: null },
      { x: 3, y: 3 },
      { x: 4, y: 4 },
    ], 50)

    expect(d.match(/Z/g)).toHaveLength(2)
    expect(d.match(/M /g)).toHaveLength(2)
  })
})

describe('symbolPath', () => {
  it('каждая форма даёт замкнутый путь без NaN', () => {
    for (const shape of GR_CHART_SHAPES) {
      const d = symbolPath(shape, 10, 10, 8)

      expect(d, shape).toContain('Z')
      expect(d, shape).not.toContain('NaN')
    }
  })

  it('формы не совпадают между собой — это второй различитель серии', () => {
    const paths = GR_CHART_SHAPES.map(shape => symbolPath(shape, 0, 0, 10))

    expect(new Set(paths).size).toBe(GR_CHART_SHAPES.length)
  })
})

describe('dashArrayFor', () => {
  it('сплошная линия штриховки не получает', () => {
    expect(dashArrayFor('none', 2)).toBeUndefined()
  })

  it('узор считается от толщины линии', () => {
    expect(dashArrayFor('dash', 1)).not.toBe(dashArrayFor('dash', 4))
  })

  it('нулевая толщина не даёт вырожденного узора', () => {
    expect(dashArrayFor('dot', 0)).toBe('0.5 1')
  })
})
