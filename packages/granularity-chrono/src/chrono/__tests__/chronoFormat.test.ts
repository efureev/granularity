import { beforeEach, describe, expect, it } from 'vitest'

import {
  dayPeriodNames,
  formatMonthTitle,
  formatPlainDate,
  formatPlainTime,
  localeFirstDayOfWeek,
  localeUsesTwelveHour,
  monthNames,
  resetChronoFormatCache,
  weekdayNames,
} from '../chronoFormat'

beforeEach(() => {
  resetChronoFormatCache()
})

describe('первый день недели', () => {
  it.each([
    ['ru-RU', 1],
    ['de-DE', 1],
    ['en-US', 7],
    ['en-GB', 1],
  ])('%s → %i', (locale, firstDay) => {
    expect(localeFirstDayOfWeek(locale)).toBe(firstDay)
  })

  it('на неизвестном теге возвращается понедельник, а не исключение', () => {
    // Локаль приходит из настроек приложения, и опечатка не имеет права
    // уронить рендер календаря.
    expect(localeFirstDayOfWeek('не-локаль!!')).toBe(1)
  })
})

describe('12- или 24-часовой вид', () => {
  it.each([
    ['en-US', true],
    ['ru-RU', false],
    ['de-DE', false],
  ])('%s → 12-часовой: %s', (locale, twelve) => {
    expect(localeUsesTwelveHour(locale)).toBe(twelve)
  })

  it('на неизвестном теге — 24 часа', () => {
    expect(localeUsesTwelveHour('не-локаль!!')).toBe(false)
  })
})

describe('названия месяцев', () => {
  it('двенадцать штук в календарном порядке', () => {
    const names = monthNames('en-US')

    expect(names).toHaveLength(12)
    expect(names[0]).toBe('January')
    expect(names[11]).toBe('December')
  })

  it('приходят из Intl, а не из словаря пакета', () => {
    expect(monthNames('ru-RU')[7]).toBe('август')
    expect(monthNames('de-DE')[7]).toBe('August')
  })

  it('короткая и узкая формы отличаются от полной', () => {
    expect(monthNames('en-US', 'short')[0]).toBe('Jan')
    expect(monthNames('en-US', 'narrow')[0]).toBe('J')
  })
})

describe('названия дней недели', () => {
  it('идут в порядке показа, а не в порядке ISO', () => {
    // Шапка сетки обязана совпасть с её колонками; перекладывать массив на
    // стороне компонента значило бы завести второе место для этой
    // договорённости.
    expect(weekdayNames('en-US', 1)).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'])
    expect(weekdayNames('en-US', 7)).toEqual(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'])
  })

  it('семь штук на любой локали и любом старте', () => {
    for (const firstDay of [1, 2, 3, 4, 5, 6, 7] as const)
      expect(weekdayNames('ru-RU', firstDay)).toHaveLength(7)
  })

  it('локализованы', () => {
    expect(weekdayNames('ru-RU', 1)[0]).toBe('пн')
  })
})

describe('показ значения', () => {
  it('дата берётся как календарная, без сдвига по зоне', () => {
    // Прогон идёт в `America/New_York` (UTC−4/−5). Наивное
    // `new Date(y, m, d)` + форматтер в UTC показал бы предыдущий день.
    expect(formatPlainDate('en-US', { y: 2026, m: 7, d: 12 }, { dateStyle: 'medium' }))
      .toBe('Aug 12, 2026')
    expect(formatPlainDate('ru-RU', { y: 2026, m: 0, d: 1 }, { dateStyle: 'short' }))
      .toBe('01.01.2026')
  })

  it('время показывается по правилам локали', () => {
    expect(formatPlainTime('en-US', { h: 14, min: 30, s: 0 })).toMatch(/2:30\s?PM/)
    expect(formatPlainTime('ru-RU', { h: 14, min: 30, s: 0 })).toBe('14:30')
  })

  it('полночь не превращается в предыдущий день', () => {
    expect(formatPlainDate('en-US', { y: 2026, m: 0, d: 1 }, { dateStyle: 'short' })).toBe('1/1/26')
  })

  it('заголовок панели — месяц и год', () => {
    expect(formatMonthTitle('en-US', 2026, 7)).toBe('August 2026')
    expect(formatMonthTitle('ru-RU', 2026, 7)).toBe('август 2026 г.')
  })
})

describe('половины суток', () => {
  it('английская локаль отдаёт AM и PM', () => {
    expect(dayPeriodNames('en-US')).toEqual(['AM', 'PM'])
  })

  it('локаль решает сама, как их писать', () => {
    // Срезом строки это не получить: часть стоит и до числа, и после, и
    // пишется по-своему.
    const [am, pm] = dayPeriodNames('ru-RU')

    expect(am).toBeTruthy()
    expect(pm).toBeTruthy()
    expect(am).not.toBe(pm)
  })

  it('некорректный тег локали не роняет показ', () => {
    expect(dayPeriodNames('не-локаль')).toEqual(['AM', 'PM'])
  })
})

describe('кэш', () => {
  it('повторный запрос отдаёт тот же инстанс форматтера', () => {
    // Построение `Intl.DateTimeFormat` примерно на порядок дороже самого
    // форматирования, а сетка просит имена на каждую перерисовку.
    const first = monthNames('en-US')
    const second = monthNames('en-US')

    expect(second).toEqual(first)
  })

  it('сброс кэша не меняет ответов', () => {
    const before = weekdayNames('ru-RU', 1)
    resetChronoFormatCache()

    expect(weekdayNames('ru-RU', 1)).toEqual(before)
  })
})
