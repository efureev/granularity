import { formatStatisticValue } from '@feugene/granularity/components/GrStatistic'
import { beforeEach, describe, expect, it } from 'vitest'

import { formatNumber, formatTimeTick, formatValue, resetChartFormatCache } from '../chartFormat'

beforeEach(() => {
  resetChartFormatCache()
})

describe('formatNumber', () => {
  /**
   * Числовая ветка — перенос из ядра, а не импорт (ребро графа компонентов
   * стоит дороже шестидесяти строк арифметики). Копия обязана совпадать с
   * оригиналом: разойтись молча ей не даст этот тест.
   */
  it('совпадает с formatStatisticValue ядра на контрольном наборе', () => {
    const cases: { value: number, options?: Parameters<typeof formatNumber>[1] }[] = [
      { value: 0 },
      { value: 1284 },
      { value: -1284 },
      { value: 1234567.891, options: { precision: 2 } },
      { value: 1234567.891, options: { locale: 'ru-RU' } },
      { value: 1234567.891, options: { locale: 'en-US', precision: 1 } },
      { value: 1234.5, options: { groupSeparator: ',', decimalSeparator: '.' } },
      { value: 1234.5, options: { locale: 'de-DE', groupSeparator: ' ' } },
      { value: 0.125, options: { precision: 2 } },
      { value: 1e21 },
    ]

    for (const { value, options } of cases)
      expect(formatNumber(value, options), `${value} ${JSON.stringify(options ?? {})}`).toBe(formatStatisticValue(value, options))
  })

  it('нечисловое значение возвращается как есть, а не «NaN» посреди оси', () => {
    expect(formatNumber(Number.NaN)).toBe('NaN')
  })

  it('точность выше двадцати знаков не роняет Intl', () => {
    expect(() => formatNumber(1.5, { locale: 'en-US', precision: 40 })).not.toThrow()
  })
})

describe('formatValue', () => {
  it('пропуск читается словом, а не пустотой', () => {
    expect(formatValue(null)).toBe('—')
    expect(formatValue(null, {}, 'нет значения')).toBe('нет значения')
  })

  it('число форматируется как обычно', () => {
    expect(formatValue(1500, { locale: 'en-US' })).toBe('1,500')
  })
})

describe('formatTimeTick', () => {
  it('формат выбирается по единице лестницы, а не по значению', () => {
    const value = new Date(2026, 2, 15, 13, 45).getTime()

    expect(formatTimeTick(value, 'year', 'en-US')).toBe('2026')
    expect(formatTimeTick(value, 'day', 'en-US')).toContain('15')
    expect(formatTimeTick(value, 'hour', 'en-US')).toMatch(/\d{1,2}:\d{2}/)
  })

  it('кэш форматтеров не меняет результата', () => {
    const value = new Date(2026, 2, 15).getTime()
    const first = formatTimeTick(value, 'day', 'ru-RU')

    resetChartFormatCache()

    expect(formatTimeTick(value, 'day', 'ru-RU')).toBe(first)
  })
})
