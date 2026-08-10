import { describe, expect, it } from 'vitest'

import { addStep, bigStep, decimalsOf } from '../numberInputMath'

describe('decimalsOf', () => {
  it('считает знаки после запятой', () => {
    expect(decimalsOf(1)).toBe(0)
    expect(decimalsOf(1.5)).toBe(1)
    expect(decimalsOf(0.125)).toBe(3)
    expect(decimalsOf(-2.25)).toBe(2)
  })

  it('разбирает экспоненциальную запись, а не считает её целым числом', () => {
    // `String(1e-7)` — это `"1e-7"`: наивный поиск точки дал бы ноль знаков,
    // и округление съело бы значение целиком.
    expect(decimalsOf(1e-7)).toBe(7)
    expect(decimalsOf(1.5e-7)).toBe(8)
    expect(decimalsOf(1e21)).toBe(0)
  })

  it('не падает на нечисле', () => {
    expect(decimalsOf(Number.NaN)).toBe(0)
    expect(decimalsOf(Number.POSITIVE_INFINITY)).toBe(0)
  })
})

describe('addStep', () => {
  // Ровно та арифметика, которую поле показывало пользователю как
  // `0.30000000000000004` на третьем нажатии `↑`.
  it('не копит двоичную погрешность', () => {
    expect(addStep(addStep(addStep(0, 0.1), 0.1), 0.1)).toBe(0.3)
    expect(addStep(2.2, 1.1)).toBe(3.3)
    expect(addStep(0.7, 0.3)).toBe(1)
  })

  it('берёт разрядность по большему из операндов', () => {
    // Шаг грубее значения — точность значения не теряется.
    expect(addStep(1.25, 0.5)).toBe(1.75)
    // Значение грубее шага — знаки шага сохраняются.
    expect(addStep(1, 0.001)).toBe(1.001)
  })

  it('шагает вниз тем же правилом', () => {
    expect(addStep(0.3, -0.1)).toBe(0.2)
    expect(addStep(3.3, -1.1)).toBe(2.2)
  })

  it('целые числа проходят как есть', () => {
    expect(addStep(10, 5)).toBe(15)
    expect(addStep(-3, 1)).toBe(-2)
  })
})

describe('bigStep', () => {
  it('без границ — десять шагов', () => {
    expect(bigStep(1)).toBe(10)
    expect(bigStep(0.5)).toBe(5)
    expect(bigStep(2, 0)).toBe(20)
  })

  it('с границами берёт большее из десяти шагов и десятой части диапазона', () => {
    // Диапазон широкий: десятая часть крупнее десяти шагов.
    expect(bigStep(1, 0, 1000)).toBe(100)
    // Диапазон узкий: десять шагов крупнее.
    expect(bigStep(1, 0, 20)).toBe(10)
  })

  it('десятая часть округляется по шагу', () => {
    expect(bigStep(3, 0, 1000)).toBe(99)
  })

  it('вырожденный диапазон не даёт нулевого шага', () => {
    expect(bigStep(1, 5, 5)).toBe(10)
  })
})
