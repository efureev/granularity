import { describe, expect, it } from 'vitest'

import { barBandwidth, barHitIndex, barPath, barRect, barToward, groupSlots } from '../chartBars'
import { bandScale } from '../chartScale'

describe('groupSlots', () => {
  it('одна серия занимает полосу целиком', () => {
    expect(groupSlots(1, 40)).toEqual([{ offset: 0, width: 40 }])
  })

  it('слоты идут слева направо и умещаются в полосу', () => {
    const slots = groupSlots(3, 60, { groupPadding: 0 })

    expect(slots.map(slot => slot.offset)).toEqual([-20, 0, 20])
    expect(slots.every(slot => slot.width === 20)).toBe(true)
    expect(slots[0]!.offset - slots[0]!.width / 2).toBe(-30)
    expect(slots[2]!.offset + slots[2]!.width / 2).toBe(30)
  })

  it('зазор сужает полосы, не двигая их центры', () => {
    const tight = groupSlots(3, 60, { groupPadding: 0 })
    const loose = groupSlots(3, 60, { groupPadding: 0.5 })

    expect(loose.map(slot => slot.offset)).toEqual(tight.map(slot => slot.offset))
    expect(loose[0]!.width).toBeLessThan(tight[0]!.width)
  })

  it('вырожденный вход не даёт слотов', () => {
    expect(groupSlots(0, 40)).toEqual([])
    expect(groupSlots(3, 0)).toEqual([])
  })

  it('зазор в единицу не съедает полосу целиком', () => {
    expect(groupSlots(2, 40, { groupPadding: 1 })[0]!.width).toBeGreaterThan(0)
  })
})

describe('barRect', () => {
  const slot = { offset: 0, width: 20 }

  it('порядок границ не важен: столбец вниз от нуля — такой же столбец', () => {
    expect(barRect(100, slot, 200, 50)).toEqual(barRect(100, slot, 50, 200))
    expect(barRect(100, slot, 200, 50)).toEqual({ x: 90, y: 50, width: 20, height: 150 })
  })

  it('смещение слота двигает полосу, а не её ширину', () => {
    expect(barRect(100, { offset: 15, width: 20 }, 200, 100).x).toBe(105)
  })
})

describe('barPath', () => {
  const rect = { x: 10, y: 20, width: 30, height: 80 }

  it('нулевой радиус даёт прямоугольник без дуг', () => {
    const d = barPath(rect, 0)

    expect(d).not.toContain('A ')
    expect(d.endsWith('Z')).toBe(true)
  })

  it('скругляются только два угла — дальние от базовой линии', () => {
    expect(barPath(rect, 4).match(/A /g)).toHaveLength(2)
    expect(barPath(rect, 4, 'down').match(/A /g)).toHaveLength(2)
  })

  it('вверх и вниз — разные пути: скругление переезжает на другой конец', () => {
    expect(barPath(rect, 4)).not.toBe(barPath(rect, 4, 'down'))
  })

  it('радиус зажимается по половине ширины и по высоте', () => {
    // Незажатый радиус вывернул бы дугу наизнанку на низкой полосе.
    const low = barPath({ x: 0, y: 0, width: 30, height: 3 }, 12)
    const narrow = barPath({ x: 0, y: 0, width: 6, height: 80 }, 12)

    expect(low).toContain('A 3 3')
    expect(narrow).toContain('A 3 3')
  })

  it('вырожденная полоса не рисуется', () => {
    expect(barPath({ x: 0, y: 0, width: 0, height: 10 }, 4)).toBe('')
    expect(barPath({ x: 0, y: 0, width: 10, height: 0 }, 4)).toBe('')
  })
})

describe('barPath: горизонтальные полосы', () => {
  const rect = { x: 10, y: 20, width: 60, height: 12 }

  it('скругляется дальний конец, а не все четыре угла', () => {
    // `<rect rx>` скруглил бы и тот конец, которым полоса стоит на базовой
    // линии, — и полоса оторвалась бы от неё.
    expect(barPath(rect, 4, 'right').match(/A /g)).toHaveLength(2)
    expect(barPath(rect, 4, 'left').match(/A /g)).toHaveLength(2)
  })

  it('вправо и влево — разные пути', () => {
    expect(barPath(rect, 4, 'right')).not.toBe(barPath(rect, 4, 'left'))
  })

  it('радиус зажимается по половине высоты и по длине полосы', () => {
    const thin = barPath({ x: 0, y: 0, width: 60, height: 3 }, 12, 'right')
    const short = barPath({ x: 0, y: 0, width: 5, height: 30 }, 12, 'right')

    expect(thin).not.toContain('NaN')
    expect(short).not.toContain('NaN')
    expect(thin.match(/A /g)).toHaveLength(2)
  })

  it('нулевая полоса пути не даёт', () => {
    expect(barPath({ x: 0, y: 0, width: 0, height: 12 }, 4, 'right')).toBe('')
  })
})

const area = { x: 0, y: 0, width: 400, height: 200 }

/** Полосная шкала-заглушка: категории через равные шаги от нуля. */
function bandLike(step: number, bandwidth: number) {
  return {
    scale: (value: number) => value * step + step / 2,
    invert: (px: number) => (px - step / 2) / step,
    bandwidth,
    step,
    domain: [0, 1] as [number, number],
    range: [0, 400] as [number, number],
    kind: 'band' as const,
  }
}

describe('barRect и ориентация', () => {
  it('вертикаль: слот задаёт ширину, значения — высоту', () => {
    const rect = barRect(100, { offset: 0, width: 20 }, 180, 40)

    expect(rect).toEqual({ x: 90, y: 40, width: 20, height: 140 })
  })

  it('горизонталь: слот задаёт высоту, значения — ширину', () => {
    // Та же полоса, повёрнутая: перепутанные стороны дали бы столбец, растущий
    // поперёк собственной категории, и заметить это можно было бы только глазами.
    const rect = barRect(100, { offset: 0, width: 20 }, 40, 180)

    expect(barRect(100, { offset: 0, width: 20 }, 40, 180, 'horizontal'))
      .toEqual({ x: 40, y: 90, width: 140, height: 20 })
    expect(rect.width).toBe(20)
  })

  it('порядок `from`/`to` не важен ни в одной ориентации', () => {
    expect(barRect(100, { offset: 0, width: 20 }, 180, 40, 'horizontal'))
      .toEqual(barRect(100, { offset: 0, width: 20 }, 40, 180, 'horizontal'))
  })
})

describe('barToward', () => {
  it('вертикаль: рост вверх по экрану — скругляется верх', () => {
    expect(barToward(180, 40)).toBe('up')
    expect(barToward(40, 180)).toBe('down')
  })

  it('горизонталь: рост вправо — скругляется правый конец', () => {
    expect(barToward(40, 180, 'horizontal')).toBe('right')
    expect(barToward(180, 40, 'horizontal')).toBe('left')
  })
})

describe('barBandwidth', () => {
  it('полосная шкала знает ширину сама', () => {
    expect(barBandwidth(bandLike(40, 32), area, 10)).toBe(32)
  })

  it('на непрерывной шкале полоса получает долю области с зазором', () => {
    // Без зазора столбцы сомкнулись бы в сплошную заливку.
    expect(barBandwidth(bandLike(40, 0), area, 10)).toBeCloseTo(32)
  })

  it('при горизонтали доля считается от высоты, а не от ширины', () => {
    expect(barBandwidth(bandLike(40, 0), area, 10, 'horizontal')).toBeCloseTo(16)
  })
})

describe('barHitIndex', () => {
  const scale = bandLike(40, 32)
  const positions = [0, 1, 2, 3]

  it('находит категорию под указателем', () => {
    expect(barHitIndex({ point: { x: 60, y: 100 }, area, positions, scale, bandwidth: 32 })).toBe(1)
  })

  it('промахивается в зазоре между категориями', () => {
    // Ровно посередине между центрами: 20 от каждого при полуширине 16.
    expect(barHitIndex({ point: { x: 40, y: 100 }, area, positions, scale, bandwidth: 32 })).toBe(-1)
  })

  it('промахивается за пределами области поперёк', () => {
    expect(barHitIndex({ point: { x: 60, y: 260 }, area, positions, scale, bandwidth: 32 })).toBe(-1)
  })

  it('при горизонтали оси меняются ролями', () => {
    expect(barHitIndex({ point: { x: 100, y: 60 }, area, positions, scale, bandwidth: 32, orientation: 'horizontal' })).toBe(1)
    // Тот же указатель без указания ориентации попал бы мимо.
    expect(barHitIndex({ point: { x: 100, y: 60 }, area, positions, scale, bandwidth: 32 })).toBe(2)
  })

  it('пустой набор категорий — всегда промах', () => {
    expect(barHitIndex({ point: { x: 60, y: 100 }, area, positions: [], scale, bandwidth: 32 })).toBe(-1)
  })
})

describe('barHitIndex — бинарный поиск против обхода', () => {
  /** Прежняя реализация: обход всех категорий. Эталон для сверки. */
  function scanHitIndex(input: Parameters<typeof barHitIndex>[0]): number {
    const orientation = input.orientation ?? 'vertical'
    const [low, high] = [input.area.y, input.area.y + input.area.height]
    const across = orientation === 'horizontal' ? input.point.x : input.point.y

    if (orientation === 'vertical' && (across < low || across > high))
      return -1
    if (input.positions.length === 0)
      return -1

    const along = orientation === 'horizontal' ? input.point.y : input.point.x
    let index = 0
    let best = Number.POSITIVE_INFINITY

    for (let i = 0; i < input.positions.length; i += 1) {
      const distance = Math.abs(along - input.scale.scale(input.positions[i]!))

      if (distance < best) {
        best = distance
        index = i
      }
    }

    return best <= input.bandwidth / 2 ? index : -1
  }

  it('отвечают одинаково на каждом пикселе области', () => {
    const area = { x: 0, y: 0, width: 240, height: 100 }
    const scale = bandScale(6, [area.x, area.x + area.width])
    const positions = [0, 1, 2, 3, 4, 5]

    for (let px = 0; px <= area.width; px += 1) {
      const input = { point: { x: px, y: 50 }, area, positions, scale, bandwidth: scale.bandwidth }

      expect(barHitIndex(input), `пиксель ${px}`).toBe(scanHitIndex(input))
    }
  })

  it('совпадают и на ряде с пропущенной категорией', () => {
    // Скрытая серия оставляет дыру в позициях: номер категории и её место в
    // массиве расходятся, и арифметика по равномерному шагу тут соврала бы.
    const area = { x: 0, y: 0, width: 240, height: 100 }
    const scale = bandScale(6, [area.x, area.x + area.width])
    const positions = [0, 2, 3, 5]

    for (let px = 0; px <= area.width; px += 1) {
      const input = { point: { x: px, y: 50 }, area, positions, scale, bandwidth: scale.bandwidth }

      expect(barHitIndex(input), `пиксель ${px}`).toBe(scanHitIndex(input))
    }
  })

  it('пустой ряд — мимо', () => {
    const area = { x: 0, y: 0, width: 240, height: 100 }
    const scale = bandScale(0, [area.x, area.x + area.width])

    expect(barHitIndex({ point: { x: 10, y: 50 }, area, positions: [], scale, bandwidth: 0 })).toBe(-1)
  })
})
