import { describe, expect, it } from 'vitest'

import { isoDateAdapter } from '../../chrono/chronoModel'
import { multipleCodec } from '../usePickerShell'

/**
 * Кодеки разведены по форме модели: одно значение, пара, набор. Оболочка про
 * форму больше ничего не знает, поэтому весь разбор проверяется здесь.
 *
 * Предмет — не «массив разбирается», а **терпимость**: набор приходит из
 * хранилища и с сервера, и одна испорченная дата не повод потерять остальные.
 */
const codec = multipleCodec(isoDateAdapter)

function keys(dates: Date[] | null): string[] {
  return (dates ?? []).map(date => date.toISOString().slice(0, 10))
}

describe('multipleCodec', () => {
  it('разбирает каждый элемент адаптером', () => {
    expect(keys(codec.parse(['2026-08-12', '2026-08-14']))).toEqual(['2026-08-12', '2026-08-14'])
  })

  it('неразобравшийся элемент выпадает, остальные остаются', () => {
    expect(keys(codec.parse(['2026-08-12', 'не дата', '2026-08-14']))).toEqual(['2026-08-12', '2026-08-14'])
  })

  it('не массив и пустой набор дают `null`', () => {
    expect(codec.parse(null)).toBeNull()
    expect(codec.parse('2026-08-12' as never)).toBeNull()
    expect(codec.parse([])).toBeNull()
    expect(codec.parse(['мусор'])).toBeNull()
  })

  it('обратно уходит массив значений потребителя', () => {
    expect(codec.serialize([new Date(2026, 7, 12), new Date(2026, 7, 14)])).toEqual(['2026-08-12', '2026-08-14'])
  })

  /** Скрытые поля формы: N значений с одним именем читаются `FormData.getAll`. */
  it('в форму уходит по строке на дату', () => {
    expect(codec.toFormValues([new Date(2026, 7, 12), new Date(2026, 7, 14)])).toEqual(['2026-08-12', '2026-08-14'])
  })
})
