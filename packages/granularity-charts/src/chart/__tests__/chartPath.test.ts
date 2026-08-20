import { describe, expect, it } from 'vitest'

import { areaPath, bandPath, bridgePath, commandsToPath, curveCommands, dashArrayFor, GR_CHART_SHAPES, linePath, segmentsOf, symbolPath } from '../chartPath'

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

describe('bandPath', () => {
  const top = [{ x: 0, y: 10 }, { x: 10, y: 20 }, { x: 20, y: 15 }]
  const base = [{ x: 0, y: 40 }, { x: 10, y: 40 }, { x: 20, y: 40 }]

  it('замыкает полосу одной фигурой, а не двумя лентами', () => {
    const d = bandPath(top, base)

    // Один `M` на полосу: низ дописывается через `L`, иначе получилось бы два
    // подпути и заливка разъехалась бы.
    expect(d.match(/M /g)).toHaveLength(1)
    expect(d.endsWith('Z')).toBe(true)
  })

  it('низ обходится в обратном порядке', () => {
    const d = bandPath(top, base)
    const closing = d.slice(d.indexOf('L 20 40'))

    expect(closing).toContain('L 20 40')
    expect(d.indexOf('L 20 40')).toBeLessThan(d.indexOf('L 0 40'))
  })

  it('разрыв по любой из границ рвёт полосу', () => {
    const gapTop = bandPath(
      [{ x: 0, y: 10 }, { x: 10, y: null }, { x: 20, y: 15 }, { x: 30, y: 12 }],
      [{ x: 0, y: 40 }, { x: 10, y: 40 }, { x: 20, y: 40 }, { x: 30, y: 40 }],
    )
    const gapBase = bandPath(
      [{ x: 0, y: 10 }, { x: 10, y: 12 }, { x: 20, y: 15 }, { x: 30, y: 12 }],
      [{ x: 0, y: 40 }, { x: 10, y: null }, { x: 20, y: 40 }, { x: 30, y: 40 }],
    )

    // Слева от разрыва осталась одна точка — полосы из неё не выйдет.
    expect(gapTop.match(/M /g)).toHaveLength(1)
    expect(gapBase.match(/M /g)).toHaveLength(1)
  })

  it('полоса из одной точки не рисуется', () => {
    expect(bandPath([{ x: 0, y: 10 }], [{ x: 0, y: 40 }])).toBe('')
  })

  it('гладкая полоса гладкая по обеим границам', () => {
    const d = bandPath(top, base, 'smooth')

    expect(d.match(/C /g)!.length).toBeGreaterThanOrEqual(4)
  })
})

describe('bridgePath', () => {
  it('соединяет конец куска с началом следующего', () => {
    const d = bridgePath([
      { x: 0, y: 10 },
      { x: 10, y: 20 },
      { x: 20, y: null },
      { x: 30, y: 40 },
    ])

    expect(d).toBe('M 10 20 L 30 40')
  })

  it('перемычка на каждый разрыв', () => {
    const d = bridgePath([
      { x: 0, y: 1 },
      { x: 10, y: null },
      { x: 20, y: 3 },
      { x: 30, y: null },
      { x: 40, y: 5 },
    ])

    expect(d.match(/M /g)).toHaveLength(2)
  })

  it('ряд без разрывов перемычек не даёт', () => {
    expect(bridgePath([{ x: 0, y: 1 }, { x: 10, y: 2 }])).toBe('')
    expect(bridgePath([])).toBe('')
  })

  it('одинокая точка между разрывами перемычки получает: линии у неё нет вовсе', () => {
    const d = bridgePath([
      { x: 0, y: 1 },
      { x: 10, y: null },
      { x: 20, y: 3 },
      { x: 30, y: null },
      { x: 40, y: 5 },
    ])

    expect(d).toContain('L 20 3')
    expect(d).toContain('M 20 3')
  })

  it('перемычка всегда прямая — даже там, где линия сглажена', () => {
    // Кривая перемычка нарисовала бы ход значения там, где его не измеряли.
    const gapped = [{ x: 0, y: 0 }, { x: 10, y: 10 }, { x: 20, y: null }, { x: 30, y: 30 }, { x: 40, y: 40 }]

    expect(bridgePath(gapped)).not.toContain('C ')
    expect(linePath(gapped, 'smooth')).toContain('C ')
  })
})

/**
 * Команды рисования — третий вид между сегментами и разметкой.
 *
 * Ради них всё и заведено: математика кривой считается один раз, а строка `d` и
 * холст берут из неё числа каждый по-своему. Тест эквивалентности — страховка
 * от единственного способа их рассорить: посчитать кривую дважды.
 */
describe('команды рисования', () => {
  const points = [
    { x: 0, y: 10 },
    { x: 10, y: 30 },
    { x: 20, y: 20 },
    { x: 30, y: null },
    { x: 40, y: 5 },
    { x: 50, y: 25 },
  ]

  it.each(['linear', 'smooth', 'step'] as const)('«%s»: строка из команд совпадает с `linePath`', (curve) => {
    expect(commandsToPath(curveCommands(points, curve))).toBe(linePath(points, curve))
  })

  it('разрыв даёт второй `move`, а не соединение', () => {
    const moves = curveCommands(points, 'linear').filter(command => command.op === 'move')

    expect(moves).toHaveLength(2)
  })

  it('одиночная точка команд не даёт: линии из неё нет', () => {
    expect(curveCommands([{ x: 0, y: 1 }], 'linear')).toEqual([])
  })

  it('«smooth» даёт кубики, «step» — только прямые', () => {
    expect(curveCommands(points, 'smooth').some(command => command.op === 'cubic')).toBe(true)
    expect(curveCommands(points, 'step').every(command => command.op !== 'cubic')).toBe(true)
  })

  /**
   * Порядок контрольных точек в `C` закреплён числами.
   *
   * До этого теста перестановка `x1 y1` и `x2 y2` при печати не ловилась ничем:
   * кривая оставалась монотонной, длина строки не менялась, а рисунок «плыл».
   * На отрезке (0,0)—(30,30) наклон единичный, поэтому касательные равны 1,
   * шаг `h` равен 10, и контрольные точки обязаны лечь на (10,10) и (20,20).
   */
  it('«smooth» печатает контрольные точки в правильном порядке', () => {
    expect(linePath([{ x: 0, y: 0 }, { x: 30, y: 30 }], 'smooth')).toBe('M 0 0 C 10 10 20 20 30 30')
  })

  /** Округление — забота строки: холсту достаётся полная точность. */
  it('в командах координаты не округлены', () => {
    const exact = [{ x: 0, y: 0 }, { x: 1 / 3, y: 2 / 3 }]
    const [, line] = curveCommands(exact, 'linear')

    expect(line).toEqual({ op: 'line', x: 1 / 3, y: 2 / 3 })
    expect(commandsToPath(curveCommands(exact, 'linear'))).toContain('0.33')
  })
})
