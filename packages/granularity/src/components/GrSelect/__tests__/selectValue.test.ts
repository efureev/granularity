import { describe, expect, it, vi } from 'vitest'

import { isEmptySelectValue, selectValueKey, toSelectArray } from '../selectValue'

describe('selectValueKey', () => {
  it('скаляр становится своей строкой', () => {
    expect(selectValueKey('ru')).toBe('ru')
    expect(selectValueKey(42)).toBe('42')
    expect(selectValueKey(0)).toBe('0')
    expect(selectValueKey(null)).toBe('null')
  })

  it('объект сравнивается по valueKey, а не по ссылке', () => {
    const key = selectValueKey({ id: 7, label: 'RU' }, 'id')

    // Модель приходит снаружи отдельной копией: `===` не совпал бы ни с одной опцией.
    expect(key).toBe('7')
    expect(selectValueKey({ id: 7, label: 'другой лейбл' }, 'id')).toBe(key)
  })

  it('объект без valueKey сводится к JSON и предупреждает в dev', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    // Без поля-идентификатора опции неотличимы — об этом надо сказать вслух.
    expect(selectValueKey({ id: 7 })).toBe('{"id":7}')
    expect(warn).toHaveBeenCalledTimes(1)

    warn.mockRestore()
  })

  it('объект, у которого нет самого поля valueKey, тоже предупреждает', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    expect(selectValueKey({ code: 'ru' }, 'id')).toBe('{"code":"ru"}')
    expect(warn).toHaveBeenCalledTimes(1)

    warn.mockRestore()
  })
})

describe('isEmptySelectValue', () => {
  it('пусто — это undefined, null и пустая строка', () => {
    expect(isEmptySelectValue(undefined)).toBe(true)
    expect(isEmptySelectValue(null)).toBe(true)
    expect(isEmptySelectValue('')).toBe(true)
  })

  it('ноль и false — валидные значения', () => {
    // Прежняя проверка `if (!value)` теряла ноль вместе с пустой строкой.
    expect(isEmptySelectValue(0)).toBe(false)
    expect(isEmptySelectValue(false)).toBe(false)
    expect(isEmptySelectValue([])).toBe(false)
  })
})

describe('toSelectArray', () => {
  it('массив отдаётся как есть, скаляр заворачивается, пустое даёт пустой набор', () => {
    const list = ['a', 'b']

    expect(toSelectArray(list)).toBe(list)
    expect(toSelectArray('a')).toEqual(['a'])
    expect(toSelectArray(0)).toEqual([0])
    expect(toSelectArray('')).toEqual([])
    expect(toSelectArray(null as unknown as string)).toEqual([])
  })
})
