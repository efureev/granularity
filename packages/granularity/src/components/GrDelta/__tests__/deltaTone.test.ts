import { describe, expect, it } from 'vitest'

import { deltaDirection, deltaTone } from '../deltaTone'

describe('deltaTone', () => {
  it('рост — успех, падение — опасность при positive-good', () => {
    expect(deltaTone(12.5, 'positive-good')).toBe('success')
    expect(deltaTone(-12.5, 'positive-good')).toBe('danger')
  })

  // Себестоимость, время отклика, отток: рост там — проблема.
  it('negative-good инвертирует тон', () => {
    expect(deltaTone(12.5, 'negative-good')).toBe('danger')
    expect(deltaTone(-12.5, 'negative-good')).toBe('success')
  })

  it('polarity=none снимает тон с любого знака', () => {
    expect(deltaTone(12.5, 'none')).toBe('neutral')
    expect(deltaTone(-12.5, 'none')).toBe('neutral')
  })

  // Ровно та ошибка, ради которой функция и вынесена: в приложении стояло
  // `value < 0 ? danger : success`, и нулевое движение красилось зелёным.
  it.each(['positive-good', 'negative-good', 'none'] as const)(
    'ноль нейтрален при polarity=%s',
    (polarity) => {
      expect(deltaTone(0, polarity)).toBe('neutral')
      expect(deltaTone(-0, polarity)).toBe('neutral')
    },
  )

  it('дефолтная полярность — positive-good', () => {
    expect(deltaTone(1)).toBe('success')
    expect(deltaTone(-1)).toBe('danger')
  })

  it('NaN тона не получает', () => {
    expect(deltaTone(Number.NaN, 'positive-good')).toBe('neutral')
  })
})

describe('deltaDirection', () => {
  it('знак задаёт направление, ноль — плоский', () => {
    expect(deltaDirection(3)).toBe('up')
    expect(deltaDirection(-3)).toBe('down')
    expect(deltaDirection(0)).toBe('flat')
    expect(deltaDirection(Number.NaN)).toBe('flat')
  })

  // Направление не зависит от полярности: «−15 % себестоимости» зелёное,
  // но стрелка всё равно вниз — величина уменьшилась.
  it('не знает про полярность', () => {
    expect(deltaDirection(-15)).toBe('down')
  })
})
