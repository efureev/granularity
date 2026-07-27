import { describe, expect, it } from 'vitest'

import { formatStatisticValue } from '../formatStatisticValue'

describe('formatStatisticValue', () => {
  it('группирует разряды и уважает точность', () => {
    expect(formatStatisticValue(1234567.891, { precision: 2 })).toBe('1 234 567.89')
    expect(formatStatisticValue(1234567.891, { precision: 0 })).toBe('1 234 568')
  })

  it('позволяет задать свои разделители', () => {
    expect(formatStatisticValue(1234.5, { precision: 2, groupSeparator: ',', decimalSeparator: '.' }))
      .toBe('1,234.50')
    expect(formatStatisticValue(1234.5, { precision: 1, groupSeparator: '', decimalSeparator: ',' }))
      .toBe('1234,5')
  })

  it('без точности оставляет дробную часть как есть', () => {
    expect(formatStatisticValue(9876.5)).toBe('9 876.5')
    expect(formatStatisticValue(1000)).toBe('1 000')
  })

  it('корректно обрабатывает отрицательные значения и ноль', () => {
    expect(formatStatisticValue(-1234567, { precision: 0 })).toBe('-1 234 567')
    expect(formatStatisticValue(-0.5, { precision: 2 })).toBe('-0.50')
    expect(formatStatisticValue(0, { precision: 2 })).toBe('0.00')
  })

  it('числовые строки форматируются, нечисловые возвращаются как есть', () => {
    expect(formatStatisticValue('4200', { precision: 0 })).toBe('4 200')
    expect(formatStatisticValue('2 ч 15 мин')).toBe('2 ч 15 мин')
    expect(formatStatisticValue('—')).toBe('—')
    expect(formatStatisticValue('')).toBe('')
  })

  it('не ломается на нечисловых числах', () => {
    expect(formatStatisticValue(Number.NaN)).toBe('NaN')
    expect(formatStatisticValue(Number.POSITIVE_INFINITY)).toBe('Infinity')
  })
})
