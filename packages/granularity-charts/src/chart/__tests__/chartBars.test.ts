import { describe, expect, it } from 'vitest'

import { barPath, barRect, groupSlots } from '../chartBars'

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
    expect(barPath(rect, 4, false).match(/A /g)).toHaveLength(2)
  })

  it('вверх и вниз — разные пути: скругление переезжает на другой конец', () => {
    expect(barPath(rect, 4)).not.toBe(barPath(rect, 4, false))
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
