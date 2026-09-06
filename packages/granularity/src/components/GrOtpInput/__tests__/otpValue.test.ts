import { describe, expect, it, vi } from 'vitest'

import {
  createOtpMatcher,
  isOtpGroupsValid,
  normalizeOtpInput,
  otpSeparatorIndexes,
  sanitizeOtpValue,
} from '../otpValue'

const numeric = createOtpMatcher('numeric')

function normalize(
  previous: string,
  raw: string,
  caret: number,
  length = 6,
  matcher = numeric,
  uppercase = false,
) {
  return normalizeOtpInput({ previous, raw, caret, length, matcher, uppercase })
}

describe('createOtpMatcher', () => {
  it('алфавит идёт за типом', () => {
    expect(numeric('7')).toBe(true)
    expect(numeric('a')).toBe(false)

    const alnum = createOtpMatcher('alphanumeric')
    expect(alnum('a')).toBe(true)
    expect(alnum('-')).toBe(false)

    // `text` — любой непробельный: пробел в коде смысла не несёт, а при вставке
    // из мессенджера приходит вместе с ним.
    const text = createOtpMatcher('text')
    expect(text('-')).toBe(true)
    expect(text(' ')).toBe(false)
  })

  it('своя регулярка перекрывает тип', () => {
    const hex = createOtpMatcher('numeric', '[0-9A-F]')

    expect(hex('F')).toBe(true)
    expect(hex('G')).toBe(false)
  })

  it('регулярка проверяет символ целиком, а не вхождение', () => {
    const digit = createOtpMatcher('numeric', '[0-9]')

    // Без якорей `[0-9]` нашлась бы внутри «a1», и мусор проходил бы отсевом.
    expect(digit('a')).toBe(false)
  })

  it('сломанная регулярка не роняет рендер, а возвращает к типу', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    try {
      const matcher = createOtpMatcher('numeric', '[0-9')

      expect(matcher('5')).toBe(true)
      expect(matcher('x')).toBe(false)
      expect(warn).toHaveBeenCalledTimes(1)
    }
    finally {
      warn.mockRestore()
    }
  })
})

describe('normalizeOtpInput — отсев и каретка', () => {
  it('чужие символы выкидываются, каретка переносится в новые координаты', () => {
    // Вставка из мессенджера — главный сценарий: «123-456» обязано дать «123456».
    expect(normalize('', '123-456', 7)).toEqual({ value: '123456', caret: 6 })
  })

  it('вставка одного мусора не меняет код, но каретка встаёт на место вставки', () => {
    // Было «1234», в середину вставили «--»: годного не прибавилось, и каретка
    // обязана оказаться там, куда пришлась вставка, а не в конце строки.
    expect(normalize('1234', '12--34', 4)).toEqual({ value: '1234', caret: 2 })
  })

  it('пустой ввод даёт пустое значение', () => {
    expect(normalize('', '', 0)).toEqual({ value: '', caret: 0 })
  })

  it('верхний регистр применяется при отсеве, а не после', () => {
    const alnum = createOtpMatcher('alphanumeric')

    expect(normalize('', 'ab-cd', 5, 6, alnum, true)).toEqual({ value: 'ABCD', caret: 4 })
  })
})

describe('normalizeOtpInput — перезапись вместо сдвига', () => {
  it('печать в занятую ячейку заменяет её символ, а не двигает хвост', () => {
    // Было «123456», каретка после «12», напечатали «9»: браузер уже вставил.
    expect(normalize('123456', '1293456', 3)).toEqual({ value: '129456', caret: 3 })
  })

  it('вставка нескольких символов съедает столько же ячеек', () => {
    // Было «123456», каретка после «12», вставили «99».
    expect(normalize('123456', '12993456', 4)).toEqual({ value: '129956', caret: 4 })
  })

  it('вставка в конец заполненного поля ничего не меняет', () => {
    expect(normalize('123456', '1234567', 7)).toEqual({ value: '123456', caret: 6 })
  })

  it('вставка длиннее поля обрезается, а не переполняет', () => {
    expect(normalize('', '123456789', 9)).toEqual({ value: '123456', caret: 6 })
  })

  it('удаление проходит насквозь', () => {
    expect(normalize('123456', '12345', 5)).toEqual({ value: '12345', caret: 5 })
    expect(normalize('', '', 0)).toEqual({ value: '', caret: 0 })
  })

  it('замена выделенного всего кода даёт один символ', () => {
    expect(normalize('123456', '9', 1)).toEqual({ value: '9', caret: 1 })
  })

  it('печать в начало недозаполненного кода тоже заменяет, а не сдвигает', () => {
    // Иначе одно и то же нажатие вело бы себя по-разному в зависимости от того,
    // сколько ячеек занято, — и предсказать результат стало бы нельзя.
    expect(normalize('12345', '912345', 1)).toEqual({ value: '92345', caret: 1 })
  })

  it('дописывание в конец недозаполненного кода ничего не съедает', () => {
    expect(normalize('12', '123', 3)).toEqual({ value: '123', caret: 3 })
  })
})

describe('sanitizeOtpValue', () => {
  it('чистит значение из v-model и режет по длине', () => {
    expect(sanitizeOtpValue('12-34-56-78', { length: 6, matcher: numeric, uppercase: false }))
      .toBe('123456')
  })
})

describe('otpSeparatorIndexes', () => {
  it('делит код на группы', () => {
    expect([...otpSeparatorIndexes(6, [3, 3])]).toEqual([3])
    expect([...otpSeparatorIndexes(9, [3, 3, 3])]).toEqual([3, 6])
  })

  it('разделителя после последней группы нет', () => {
    expect(otpSeparatorIndexes(4, [2, 2]).has(4)).toBe(false)
  })

  it('без групп разделителей нет', () => {
    expect(otpSeparatorIndexes(6).size).toBe(0)
    expect(otpSeparatorIndexes(6, []).size).toBe(0)
  })

  it('разбивка мимо длины игнорируется целиком, а не рисуется наполовину', () => {
    expect(otpSeparatorIndexes(6, [3, 2]).size).toBe(0)
    expect(otpSeparatorIndexes(6, [3, 0, 3]).size).toBe(0)
  })
})

describe('isOtpGroupsValid', () => {
  it('сумма групп обязана равняться длине', () => {
    expect(isOtpGroupsValid(6, [3, 3])).toBe(true)
    expect(isOtpGroupsValid(6, [3, 2])).toBe(false)
    expect(isOtpGroupsValid(6, [3, -1, 4])).toBe(false)
    expect(isOtpGroupsValid(6)).toBe(true)
  })
})
