import { describe, expect, it } from 'vitest'

import { resolveScrollOverflow } from '../scrollOverflow'

describe('resolveScrollOverflow', () => {
  it('ряд влезает целиком — затухать нечему', () => {
    expect(resolveScrollOverflow(0, 300, 300)).toBe('none')
  })

  /**
   * Браузеры округляют размеры вверх, и у влезающего ряда разница бывает
   * единичной. Без запаса затухание висело бы на ровном месте.
   */
  it('разница в пиксель переполнением не считается', () => {
    expect(resolveScrollOverflow(0, 301, 300)).toBe('none')
    expect(resolveScrollOverflow(0, 302, 300)).toBe('end')
  })

  it('в начале длинного ряда продолжение только справа', () => {
    expect(resolveScrollOverflow(0, 487, 341)).toBe('end')
  })

  it('в конце — только слева', () => {
    expect(resolveScrollOverflow(146, 487, 341)).toBe('start')
  })

  it('в середине — с обеих сторон', () => {
    expect(resolveScrollOverflow(70, 487, 341)).toBe('both')
  })

  it('край считается достигнутым с тем же запасом в пиксель', () => {
    expect(resolveScrollOverflow(1, 487, 341)).toBe('end')
    expect(resolveScrollOverflow(145, 487, 341)).toBe('start')
  })

  /**
   * В RTL `scrollLeft` отсчитывается от правого края и уходит в минус: модуль
   * работает с расстоянием от начала, поэтому знак значения не меняет.
   */
  it('отрицательный отступ из RTL читается как расстояние от начала', () => {
    expect(resolveScrollOverflow(-70, 487, 341)).toBe('both')
    expect(resolveScrollOverflow(-146, 487, 341)).toBe('start')
  })
})
