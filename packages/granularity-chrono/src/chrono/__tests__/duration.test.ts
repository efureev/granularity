import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import {
  durationToIso,
  formatDuration,
  resetDurationFormatCache,
  selectDurationParts,
} from '../duration'

beforeEach(() => {
  resetDurationFormatCache()
})

describe('selectDurationParts', () => {
  it('две единицы от первой ненулевой — «2 ч 30 мин», а не «0 дн 2 ч»', () => {
    expect(selectDurationParts(9000)).toEqual({ hour: 2, minute: 30 })
  })

  it('младшее отбрасывается, а не округляется', () => {
    // 2 ч 59 мин 30 с: округление подняло бы показ выше реально прошедшего.
    expect(selectDurationParts(10_770)).toEqual({ hour: 2, minute: 59 })
  })

  it('хвостовой ноль отбрасывается: `maxUnits` — потолок, а не квота', () => {
    expect(selectDurationParts(7200)).toEqual({ hour: 2 })
    expect(selectDurationParts(86_400, { maxUnits: 3 })).toEqual({ day: 1 })
  })

  it('число единиц задаётся', () => {
    expect(selectDurationParts(90_061, { maxUnits: 4 })).toEqual({ day: 1, hour: 1, minute: 1, second: 1 })
    expect(selectDurationParts(90_061, { maxUnits: 1 })).toEqual({ day: 1 })
  })

  it('крупнее `largestUnit` не дробится — остаток копится в ней', () => {
    expect(selectDurationParts(90_000, { largestUnit: 'hour', maxUnits: 1 })).toEqual({ hour: 25 })
  })

  it('мельче `smallestUnit` не спускается', () => {
    expect(selectDurationParts(9030, { smallestUnit: 'minute', maxUnits: 4 })).toEqual({ hour: 2, minute: 30 })
  })

  it('ноль — это «0 с», а не пустая строка: пустота читается как «нет данных»', () => {
    expect(selectDurationParts(0)).toEqual({ second: 0 })
    expect(selectDurationParts(0, { smallestUnit: 'minute' })).toEqual({ minute: 0 })
  })

  it('знака у длительности нет: это длина, а не направление', () => {
    expect(selectDurationParts(-9000)).toEqual(selectDurationParts(9000))
  })

  it('мусор на входе не роняет расчёт', () => {
    expect(selectDurationParts(Number.NaN)).toEqual({ second: 0 })
    expect(selectDurationParts(Number.POSITIVE_INFINITY)).toEqual({ second: 0 })
  })
})

describe('durationToIso', () => {
  it('считается по полному значению, а не по показанным единицам', () => {
    // `maxUnits` сокращает текст для человека; разметка обязана остаться точной.
    expect(durationToIso(10_770)).toBe('PT2H59M30S')
    expect(selectDurationParts(10_770)).toEqual({ hour: 2, minute: 59 })
  })

  it('сутки уходят в дату, остальное — во время', () => {
    expect(durationToIso(90_061)).toBe('P1DT1H1M1S')
    expect(durationToIso(86_400)).toBe('P1D')
  })

  it('ноль остаётся представимым', () => {
    expect(durationToIso(0)).toBe('PT0S')
  })
})

describe('formatDuration', () => {
  it('«2 ч 30 мин» по-русски', () => {
    expect(formatDuration('ru', 9000)).toBe('2 ч 30 мин')
  })

  it('ноль печатается, а не исчезает', () => {
    // `Intl.DurationFormat` опускает нулевые поля, и «0 с» стало бы пустой
    // строкой — то есть «нет данных» вместо «нисколько».
    expect(formatDuration('ru', 0)).toBe('0 с')
  })

  it('длина имён единиц выбирается', () => {
    expect(formatDuration('en', 9000, { style: 'short' })).toContain('hr')
    expect(formatDuration('en', 9000, { style: 'long' })).toContain('hour')
  })

  it('битая локаль не роняет рендер', () => {
    expect(() => formatDuration('не-локаль!!', 9000)).not.toThrow()
  })
})

describe('formatDuration без Intl.DurationFormat', () => {
  const original = Intl.DurationFormat

  afterEach(() => {
    Object.defineProperty(Intl, 'DurationFormat', { value: original, configurable: true, writable: true })
    resetDurationFormatCache()
  })

  function dropDurationFormat(): void {
    Object.defineProperty(Intl, 'DurationFormat', { value: undefined, configurable: true, writable: true })
    resetDurationFormatCache()
  }

  it('запасной путь даёт ту же строку', () => {
    // Пакет заявляет Node >=22, где `Intl.DurationFormat` отсутствует вовсе, а
    // SSR-стенд исполняется в Node: без этого пути рендер там падал бы.
    const expected = formatDuration('ru', 9000)

    dropDurationFormat()

    expect(formatDuration('ru', 9000)).toBe(expected)
  })

  it('запасной путь знает единицы и на других языках', () => {
    dropDurationFormat()

    expect(formatDuration('en', 9000, { style: 'long' })).toContain('hour')
    expect(formatDuration('en', 9000, { style: 'long' })).toContain('minute')
  })

  it('битая локаль не роняет и запасной путь', () => {
    dropDurationFormat()

    expect(() => formatDuration('не-локаль!!', 9000)).not.toThrow()
  })
})
