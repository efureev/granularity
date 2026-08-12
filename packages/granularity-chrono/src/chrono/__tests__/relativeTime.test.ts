import { beforeEach, describe, expect, it } from 'vitest'

import {
  formatRelativeTime,
  resetRelativeTimeCache,
  selectRelativeAmount,
} from '../relativeTime'

beforeEach(() => {
  resetRelativeTimeCache()
})

/** Прогон идёт в `America/New_York` — зоне с переводом часов (см. `setup.ts`). */
function at(iso: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?$/.exec(iso)
  if (!match) throw new Error(`не разобрал ${iso}`)

  const [, y, m, d, h, min, s] = match as unknown as [string, string, string, string?, string?, string?, string?]

  return new Date(Number(y), Number(m) - 1, Number(d), Number(h ?? 0), Number(min ?? 0), Number(s ?? 0))
}

const NOW = at('2026-08-12 12:00')

/** Насколько момент отстоит от «сейчас»: прошлое отрицательно, как у `Intl`. */
function gap(iso: string) {
  return selectRelativeAmount(NOW, at(iso))
}

describe('выбор единицы: до суток — по прошедшему времени', () => {
  it('секунды, минуты и часы', () => {
    expect(gap('2026-08-12 11:59:57')).toEqual({ value: -3, unit: 'second' })
    expect(gap('2026-08-12 11:57')).toEqual({ value: -3, unit: 'minute' })
    expect(gap('2026-08-12 08:00')).toEqual({ value: -4, unit: 'hour' })
  })

  it('границы единиц не перескакивают через себя', () => {
    // 59 секунд — ещё секунды, 60 — уже минута; та же проверка на часе.
    expect(gap('2026-08-12 11:59:01')).toEqual({ value: -59, unit: 'second' })
    expect(gap('2026-08-12 11:59:00')).toEqual({ value: -1, unit: 'minute' })
    expect(gap('2026-08-12 11:01')).toEqual({ value: -59, unit: 'minute' })
    expect(gap('2026-08-12 11:00')).toEqual({ value: -1, unit: 'hour' })
  })

  it('одна минута назад — это минута, а не 60 секунд', () => {
    expect(gap('2026-08-12 11:59')).toEqual({ value: -1, unit: 'minute' })
  })

  it('будущее считается тем же правилом и с обратным знаком', () => {
    expect(gap('2026-08-12 12:03')).toEqual({ value: 3, unit: 'minute' })
    expect(gap('2026-08-12 16:00')).toEqual({ value: 4, unit: 'hour' })
  })

  it('дробная часть отбрасывается к нулю, а не округляется', () => {
    // 90 минут — это «час назад», а не «два часа назад».
    expect(gap('2026-08-12 10:30')).toEqual({ value: -1, unit: 'hour' })
    expect(gap('2026-08-12 13:30')).toEqual({ value: 1, unit: 'hour' })
  })
})

describe('выбор единицы: от суток — по календарю', () => {
  it('вчера, неделя, месяц, год', () => {
    expect(gap('2026-08-11 12:00')).toEqual({ value: -1, unit: 'day' })
    expect(gap('2026-08-01 12:00')).toEqual({ value: -1, unit: 'week' })
    expect(gap('2026-06-12 12:00')).toEqual({ value: -2, unit: 'month' })
    expect(gap('2024-08-12 12:00')).toEqual({ value: -2, unit: 'year' })
  })

  it('неделя начинается с седьмого дня, а не с «примерно недели»', () => {
    expect(gap('2026-08-06 12:00')).toEqual({ value: -6, unit: 'day' })
    expect(gap('2026-08-05 12:00')).toEqual({ value: -1, unit: 'week' })
  })

  it('месяц считается календарём, а не тридцатью сутками', () => {
    // Между 12 июля и 12 августа 31 день, между 12 февраля и 12 марта — 28.
    // Обе разности — ровно месяц, и обе обязаны так и называться.
    expect(selectRelativeAmount(at('2026-07-12'), at('2026-08-12'))).toEqual({ value: 1, unit: 'month' })
    expect(selectRelativeAmount(at('2026-02-12'), at('2026-03-12'))).toEqual({ value: 1, unit: 'month' })
  })

  it('неполный месяц остаётся неделями', () => {
    // 31 января → 28 февраля: индексы месяцев различаются, а месяц не прошёл.
    expect(selectRelativeAmount(at('2026-01-31'), at('2026-02-28'))).toEqual({ value: 4, unit: 'week' })
  })

  it('год — это двенадцать полных месяцев', () => {
    // Одного дня не хватило — значит одиннадцать месяцев, а не «почти год».
    expect(gap('2025-08-13')).toEqual({ value: -11, unit: 'month' })
    expect(gap('2025-08-12')).toEqual({ value: -1, unit: 'year' })
  })
})

describe('перевод часов', () => {
  it('сутки, длившиеся 25 часов, — это одни сутки', () => {
    // 1 ноября 2026 в Нью-Йорке от полуночи до полуночи — 25 часов.
    expect(selectRelativeAmount(at('2026-11-02'), at('2026-11-01'))).toEqual({ value: -1, unit: 'day' })
  })

  it('месяц через переход остаётся месяцем', () => {
    // Между 8 марта и 8 апреля 2026 — 743 часа, а не 744: перевод часов съел
    // один. Календарю это безразлично, счёту в часах — нет.
    expect(selectRelativeAmount(at('2026-04-08'), at('2026-03-08'))).toEqual({ value: -1, unit: 'month' })
  })

  it('сутки, длившиеся 23 часа, честно называются часами', () => {
    // 8 марта от полуночи до полуночи 9-го — 23 часа, и это не ошибка счёта:
    // столько времени и правда прошло. До суток единицу задаёт прошедшее
    // время, и «23 часа назад» здесь вернее, чем «вчера»: иначе двухчасовой
    // разрыв через полночь каждую ночь назывался бы вчерашним.
    expect(selectRelativeAmount(at('2026-03-09'), at('2026-03-08'))).toEqual({ value: -23, unit: 'hour' })
  })
})

describe('строка от Intl', () => {
  it('локализована и склоняет числительное', () => {
    expect(formatRelativeTime('ru', { value: -3, unit: 'minute' })).toBe('3 минуты назад')
    expect(formatRelativeTime('ru', { value: -5, unit: 'minute' })).toBe('5 минут назад')
    expect(formatRelativeTime('en', { value: -3, unit: 'minute' })).toBe('3 minutes ago')
    expect(formatRelativeTime('es', { value: -2, unit: 'hour' })).toBe('hace 2 horas')
  })

  it('numeric=auto даёт «вчера», always — «1 день назад»', () => {
    expect(formatRelativeTime('ru', { value: -1, unit: 'day' })).toBe('вчера')
    expect(formatRelativeTime('ru', { value: -1, unit: 'day' }, { numeric: 'always' })).toBe('1 день назад')
  })

  it('стиль укорачивает строку, а не меняет смысл', () => {
    expect(formatRelativeTime('en', { value: -3, unit: 'month' }, { style: 'short' })).toBe('3 mo. ago')
  })

  it('будущее звучит будущим', () => {
    expect(formatRelativeTime('ru', { value: 2, unit: 'week' })).toBe('через 2 недели')
  })

  it('некорректный тег локали не роняет рендер', () => {
    // Локаль приходит из настроек приложения, и опечатка не имеет права стоить
    // белой страницы.
    expect(formatRelativeTime('не-локаль', { value: -3, unit: 'minute' })).toBe('3 minutes ago')
  })

  it('инстанс переиспользуется между вызовами', () => {
    const first = formatRelativeTime('ru', { value: -1, unit: 'hour' })

    expect(formatRelativeTime('ru', { value: -1, unit: 'hour' })).toBe(first)
  })
})
