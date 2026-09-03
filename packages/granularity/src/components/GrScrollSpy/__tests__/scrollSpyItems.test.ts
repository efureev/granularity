import { describe, expect, it } from 'vitest'

import { anchorClickHandled, ancestorSectionIds, scrollSpyOffsetLength } from '../scrollSpyItems'

describe('scrollSpyOffsetLength', () => {
  it('число превращает в пиксели', () => {
    expect(scrollSpyOffsetLength(0)).toBe('0px')
    expect(scrollSpyOffsetLength(112)).toBe('112px')
  })

  it('отрицательное зажимает в ноль', () => {
    expect(scrollSpyOffsetLength(-8)).toBe('0px')
  })

  it('строку отдаёт как есть', () => {
    expect(scrollSpyOffsetLength('4rem')).toBe('4rem')
    expect(scrollSpyOffsetLength('var(--gr-navbar-height)')).toBe('var(--gr-navbar-height)')
    expect(scrollSpyOffsetLength('  56px  ')).toBe('56px')
  })

  it('нечисло и пустая строка переменной не пишут', () => {
    expect(scrollSpyOffsetLength(Number.NaN)).toBeUndefined()
    expect(scrollSpyOffsetLength(undefined)).toBeUndefined()
    expect(scrollSpyOffsetLength('   ')).toBeUndefined()
  })
})

describe('anchorClickHandled', () => {
  const plain = { button: 0, metaKey: false, ctrlKey: false, shiftKey: false, altKey: false, defaultPrevented: false }

  it('обычный левый клик — наш', () => {
    expect(anchorClickHandled(plain)).toBe(true)
  })

  it('средняя кнопка остаётся браузеру', () => {
    expect(anchorClickHandled({ ...plain, button: 1 })).toBe(false)
  })

  it('любой модификатор остаётся браузеру', () => {
    // Cmd-клик открывает в новой вкладке, Shift — в новом окне: перехватив их,
    // компонент отнял бы работающее поведение и ничего не дал взамен.
    expect(anchorClickHandled({ ...plain, metaKey: true })).toBe(false)
    expect(anchorClickHandled({ ...plain, ctrlKey: true })).toBe(false)
    expect(anchorClickHandled({ ...plain, shiftKey: true })).toBe(false)
    expect(anchorClickHandled({ ...plain, altKey: true })).toBe(false)
  })

  it('уже отменённое событие не перехватывается', () => {
    expect(anchorClickHandled({ ...plain, defaultPrevented: true })).toBe(false)
  })
})

describe('ancestorSectionIds', () => {
  const sections = [
    { id: 'a', label: 'A', level: 1 },
    { id: 'a1', label: 'A1', level: 2 },
    { id: 'a2', label: 'A2', level: 2 },
    { id: 'b', label: 'B', level: 1 },
    { id: 'b1', label: 'B1', level: 2 },
    { id: 'b1x', label: 'B1x', level: 3 },
  ]

  it('активен подраздел — его раздел становится предком', () => {
    expect([...ancestorSectionIds(sections, 'a2')]).toEqual(['a'])
  })

  it('цепочка собирается через все уровни', () => {
    expect([...ancestorSectionIds(sections, 'b1x')]).toEqual(['b1', 'b'])
  })

  it('активен верхний уровень — предков нет', () => {
    expect([...ancestorSectionIds(sections, 'b')]).toEqual([])
  })

  it('нет активного или он не из списка — предков нет', () => {
    expect([...ancestorSectionIds(sections, null)]).toEqual([])
    expect([...ancestorSectionIds(sections, 'нет такого')]).toEqual([])
  })

  it('уровень по умолчанию — верхний', () => {
    expect([...ancestorSectionIds([{ id: 'x', label: 'X' }, { id: 'y', label: 'Y' }], 'y')]).toEqual([])
  })
})
