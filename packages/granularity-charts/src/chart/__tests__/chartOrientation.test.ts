import { describe, expect, it } from 'vitest'

import {
  acrossBounds,
  acrossOf,
  alongExtent,
  alongOf,
  orientedGrid,
  orientedPoint,
} from '../chartOrientation'

const area = { x: 10, y: 20, width: 300, height: 200 }

describe('оси «вдоль» и «поперёк»', () => {
  it('вертикаль: категории по x, значения по y', () => {
    expect(alongOf({ x: 5, y: 7 }, 'vertical')).toBe(5)
    expect(acrossOf({ x: 5, y: 7 }, 'vertical')).toBe(7)
  })

  it('горизонталь: категории по y, значения по x', () => {
    expect(alongOf({ x: 5, y: 7 }, 'horizontal')).toBe(7)
    expect(acrossOf({ x: 5, y: 7 }, 'horizontal')).toBe(5)
  })

  it('сборка обратна разбору в обеих ориентациях', () => {
    for (const orientation of ['vertical', 'horizontal'] as const) {
      const point = { x: 12, y: 34 }
      const rebuilt = orientedPoint(alongOf(point, orientation), acrossOf(point, orientation), orientation)

      expect(rebuilt).toEqual(point)
    }
  })

  it('границы поперёк — та сторона области, вдоль которой идут значения', () => {
    expect(acrossBounds(area, 'vertical')).toEqual([20, 220])
    expect(acrossBounds(area, 'horizontal')).toEqual([10, 310])
  })

  it('длина вдоль — та сторона, по которой идут категории', () => {
    expect(alongExtent(area, 'vertical')).toBe(300)
    expect(alongExtent(area, 'horizontal')).toBe(200)
  })
})

describe('сетка называет оси по данным', () => {
  it('при горизонтали стороны меняются местами', () => {
    // `showGrid: 'y'` — это всегда линии оси значений; на горизонтали они
    // становятся вертикальными, и рама, которая знает только про экран,
    // обязана получить перевёрнутое значение.
    expect(orientedGrid('y', 'horizontal')).toBe('x')
    expect(orientedGrid('x', 'horizontal')).toBe('y')
  })

  it('`both` и `none` симметричны и не переворачиваются', () => {
    expect(orientedGrid('both', 'horizontal')).toBe('both')
    expect(orientedGrid('none', 'horizontal')).toBe('none')
  })

  it('вертикаль ничего не меняет', () => {
    expect(orientedGrid('y', 'vertical')).toBe('y')
    expect(orientedGrid('x', 'vertical')).toBe('x')
  })
})
