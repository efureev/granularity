import { beforeEach, describe, expect, it } from 'vitest'

import {
  localeDateOrder,
  localeDatePattern,
  localeDateTimeOrder,
  localeTimePattern,
  maskLocaleDate,
  parseLocaleDate,
  parseLocaleDateTime,
  parseLocaleTime,
  resetChronoParseCache,
  splitLocaleRange,
} from '../chronoParse'

beforeEach(() => {
  resetChronoParseCache()
})

describe('порядок частей в локали', () => {
  it('американский — месяц, день, год через слэш', () => {
    expect(localeDateOrder('en-US')).toEqual({ order: ['month', 'day', 'year'], separator: '/' })
  })

  it('русский — день, месяц, год через точку', () => {
    expect(localeDateOrder('ru-RU')).toEqual({ order: ['day', 'month', 'year'], separator: '.' })
  })

  it('некорректный тег не роняет разбор', () => {
    expect(localeDateOrder('не-локаль').order).toHaveLength(3)
  })
})

describe('разбор даты', () => {
  it('читается по порядку локали, а не по одному правилу на всех', () => {
    // Те же цифры — разные даты: 8 декабря против 12 августа.
    expect(parseLocaleDate('en-US', '08/12/2026')).toEqual({ y: 2026, m: 7, d: 12 })
    expect(parseLocaleDate('ru-RU', '08.12.2026')).toEqual({ y: 2026, m: 11, d: 8 })
  })

  it('разделитель не важен: важны цифры', () => {
    for (const text of ['12.08.2026', '12/08/2026', '12-08-2026', '12 08 2026']) {
      expect(parseLocaleDate('ru-RU', text), text).toEqual({ y: 2026, m: 7, d: 12 })
    }
  })

  it('однозначные части допустимы', () => {
    expect(parseLocaleDate('ru-RU', '1.8.2026')).toEqual({ y: 2026, m: 7, d: 1 })
  })

  it('двузначный год разворачивается по границе 70', () => {
    expect(parseLocaleDate('ru-RU', '12.08.26')).toEqual({ y: 2026, m: 7, d: 12 })
    expect(parseLocaleDate('ru-RU', '12.08.69')).toEqual({ y: 2069, m: 7, d: 12 })
    expect(parseLocaleDate('ru-RU', '12.08.70')).toEqual({ y: 1970, m: 7, d: 12 })
  })

  it('неполный ввод — это не ошибка, а просто ещё не дата', () => {
    for (const text of ['', '1', '12.', '12.08', '12.08.2026.5']) {
      expect(parseLocaleDate('ru-RU', text), text).toBeNull()
    }
  })

  it('несуществующая дата не разбирается', () => {
    expect(parseLocaleDate('ru-RU', '31.02.2026')).toBeNull()
    expect(parseLocaleDate('ru-RU', '32.01.2026')).toBeNull()
    expect(parseLocaleDate('ru-RU', '12.13.2026')).toBeNull()
  })

  it('29 февраля высокосного года — существует', () => {
    expect(parseLocaleDate('ru-RU', '29.02.2028')).toEqual({ y: 2028, m: 1, d: 29 })
    expect(parseLocaleDate('ru-RU', '29.02.2026')).toBeNull()
  })
})

describe('маска', () => {
  it('добавляет разделители по мере набора', () => {
    expect(maskLocaleDate('ru-RU', '1')).toBe('1')
    expect(maskLocaleDate('ru-RU', '12')).toBe('12.')
    expect(maskLocaleDate('ru-RU', '1208')).toBe('12.08.')
    expect(maskLocaleDate('ru-RU', '12082026')).toBe('12.08.2026')
  })

  it('в американской локали слэши и свой порядок', () => {
    expect(maskLocaleDate('en-US', '08122026')).toBe('08/12/2026')
  })

  it('лишние цифры отбрасываются, а не уезжают в следующую часть', () => {
    expect(maskLocaleDate('ru-RU', '120820261234')).toBe('12.08.2026')
  })

  it('пустой ввод остаётся пустым: маска не дорисовывает разделители из воздуха', () => {
    expect(maskLocaleDate('ru-RU', '')).toBe('')
    expect(maskLocaleDate('ru-RU', '...')).toBe('')
  })

  it('уже набранное с разделителями не удваивает их', () => {
    expect(maskLocaleDate('ru-RU', '12.08.2026')).toBe('12.08.2026')
  })
})

describe('подсказка формата', () => {
  it('складывается из порядка локали и её букв', () => {
    const latin = { day: 'D', month: 'M', year: 'Y' }

    expect(localeDatePattern('ru-RU', latin)).toBe('DD.MM.YYYY')
    expect(localeDatePattern('en-US', latin)).toBe('MM/DD/YYYY')
    expect(localeDatePattern('ru-RU', { day: 'Д', month: 'М', year: 'Г' })).toBe('ДД.ММ.ГГГГ')
  })
})

describe('разбор времени', () => {
  it('часы и минуты, с секундами и без', () => {
    expect(parseLocaleTime('en-US', '9:30')).toEqual({ h: 9, min: 30, s: 0 })
    expect(parseLocaleTime('en-US', '09:30:45')).toEqual({ h: 9, min: 30, s: 45 })
  })

  it('половина суток читается и по подписи локали, и по латинским am/pm', () => {
    expect(parseLocaleTime('en-US', '3:30 PM')).toEqual({ h: 15, min: 30, s: 0 })
    expect(parseLocaleTime('en-US', '3:30 am')).toEqual({ h: 3, min: 30, s: 0 })
    expect(parseLocaleTime('ru-RU', '3:30 pm')).toEqual({ h: 15, min: 30, s: 0 })
  })

  it('полночь и полдень в 12-часовом виде', () => {
    expect(parseLocaleTime('en-US', '12:00 AM')).toEqual({ h: 0, min: 0, s: 0 })
    expect(parseLocaleTime('en-US', '12:00 PM')).toEqual({ h: 12, min: 0, s: 0 })
  })

  it('вне диапазона не разбирается', () => {
    expect(parseLocaleTime('en-US', '24:00')).toBeNull()
    expect(parseLocaleTime('en-US', '9:60')).toBeNull()
    expect(parseLocaleTime('en-US', '13:00 PM')).toBeNull()
    expect(parseLocaleTime('en-US', '9')).toBeNull()
  })
})

describe('взаимное расположение даты и времени', () => {
  it('вьетнамский показывает время первым', () => {
    expect(localeDateTimeOrder('vi').timeFirst).toBe(true)
    expect(localeDateTimeOrder('en-US').timeFirst).toBe(false)
  })

  it('корейский ставит половину суток перед часом, американский — после', () => {
    expect(localeDateTimeOrder('ko').dayPeriodFirst).toBe(true)
    expect(localeDateTimeOrder('en-US').dayPeriodFirst).toBe(false)
  })

  it('некорректный тег не роняет разбор', () => {
    expect(localeDateTimeOrder('не-локаль').timeSeparator).toBe(':')
  })
})

describe('разбор даты со временем', () => {
  it('дата и время через запятую', () => {
    expect(parseLocaleDateTime('ru-RU', '12.08.2026, 14:30')).toEqual({
      date: { y: 2026, m: 7, d: 12 },
      time: { h: 14, min: 30, s: 0 },
    })
  })

  it('половина суток остаётся при времени, а не при дате', () => {
    expect(parseLocaleDateTime('en-US', '8/12/2026, 3:30 PM')).toEqual({
      date: { y: 2026, m: 7, d: 12 },
      time: { h: 15, min: 30, s: 0 },
    })
  })

  it('половина суток перед часом читается там, где локаль её так и пишет', () => {
    expect(parseLocaleDateTime('ko', '2026. 8. 12. 오후 3:30')).toEqual({
      date: { y: 2026, m: 7, d: 12 },
      time: { h: 15, min: 30, s: 0 },
    })
  })

  it('время перед датой — тоже дата со временем', () => {
    expect(parseLocaleDateTime('vi', '15:30 12/8/2026')).toEqual({
      date: { y: 2026, m: 7, d: 12 },
      time: { h: 15, min: 30, s: 0 },
    })
  })

  it('секунды разбираются шестой группой', () => {
    expect(parseLocaleDateTime('ru-RU', '12.08.2026, 14:30:45')?.time).toEqual({ h: 14, min: 30, s: 45 })
  })

  it('одна дата разбирается без времени', () => {
    expect(parseLocaleDateTime('ru-RU', '12.08.2026')).toEqual({
      date: { y: 2026, m: 7, d: 12 },
      time: null,
    })
  })

  it('неполный ввод и несуществующая дата не разбираются', () => {
    expect(parseLocaleDateTime('ru-RU', '12.08.2026, 14')).toBeNull()
    expect(parseLocaleDateTime('ru-RU', '31.02.2026, 14:30')).toBeNull()
    expect(parseLocaleDateTime('ru-RU', '12.08.2026, 25:30')).toBeNull()
  })
})

describe('деление строки диапазона', () => {
  it('две даты режутся пополам по числу групп цифр', () => {
    expect(splitLocaleRange('ru-RU', '12.08.2026 — 14.08.2026')).toEqual(['12.08.2026', ' — 14.08.2026'])
  })

  /** Дефис внутри даты — не разделитель границ, и опознавать его не нужно. */
  it('дефисы внутри дат не путают деление', () => {
    const parts = splitLocaleRange('en-CA', '2026-08-12 - 2026-08-14')

    expect(parts?.map(part => parseLocaleDate('en-CA', part))).toEqual([
      { y: 2026, m: 7, d: 12 },
      { y: 2026, m: 7, d: 14 },
    ])
  })

  it('половина суток между границами достаётся своей', () => {
    const parts = splitLocaleRange('en-US', '8/12/2026, 3:30 PM — 8/14/2026, 5:00 PM')

    expect(parts?.map(part => parseLocaleDateTime('en-US', part)?.time)).toEqual([
      { h: 15, min: 30, s: 0 },
      { h: 17, min: 0, s: 0 },
    ])
  })

  it('в префиксной локали та же половина достаётся правой границе', () => {
    const parts = splitLocaleRange('ko', '2026. 8. 12. 오전 9:00 ~ 2026. 8. 14. 오후 5:00')

    expect(parts?.map(part => parseLocaleDateTime('ko', part)?.time)).toEqual([
      { h: 9, min: 0, s: 0 },
      { h: 17, min: 0, s: 0 },
    ])
  })

  it('нечётное число групп делить нечем', () => {
    expect(splitLocaleRange('ru-RU', '12.08.2026 — 14.08')).toBeNull()
    expect(splitLocaleRange('ru-RU', '')).toBeNull()
  })
})

describe('подсказка формата времени', () => {
  it('часы и минуты разделителем локали', () => {
    expect(localeTimePattern('ru-RU', { hour: 'Ч', minute: 'М', second: 'С' })).toBe('ЧЧ:ММ')
  })

  it('секунды и половина суток дописываются по запросу', () => {
    const letters = { hour: 'H', minute: 'M', second: 'S' }

    expect(localeTimePattern('en-US', letters, { seconds: true })).toBe('HH:MM:SS')
    expect(localeTimePattern('en-US', letters, { twelveHour: true })).toBe('HH:MM AM')
  })

  it('в префиксной локали половина суток идёт впереди', () => {
    const pattern = localeTimePattern('ko', { hour: 'H', minute: 'M', second: 'S' }, { twelveHour: true })

    expect(pattern.startsWith('HH')).toBe(false)
    expect(pattern.endsWith('HH:MM')).toBe(true)
  })
})
