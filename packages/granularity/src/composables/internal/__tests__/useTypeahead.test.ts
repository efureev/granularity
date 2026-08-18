import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { TYPEAHEAD_RESET_MS, useTypeahead } from '../useTypeahead'

/**
 * Поиск по первым буквам — паттерн, который в пакете был написан трижды почти
 * дословно. Правила APG здесь неочевидны и легко теряются при переписывании:
 * шаг начинается со **следующего** пункта, повтор одной буквы — это переход к
 * следующему совпадению, а не поиск удвоенной буквы.
 */
const items = ['Копировать', 'Вставить', 'Вырезать', 'Переименовать', 'Восстановить']

function setup(startAt = -1) {
  const matched: number[] = []
  let current = startAt

  const typeahead = useTypeahead<string>({
    items: () => items,
    textOf: item => item,
    currentIndex: () => current,
    onMatch: (_item, index) => {
      current = index
      matched.push(index)
    },
  })

  return { typeahead, matched, at: () => current }
}

describe('useTypeahead', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('буква ведёт к первому совпадению со следующего пункта', () => {
    const { typeahead, at } = setup()

    expect(typeahead.type('в')).toBe(true)
    expect(at()).toBe(1)
  })

  it('повтор одной буквы — следующее совпадение, а не поиск удвоенной', () => {
    const { typeahead, matched } = setup()

    typeahead.type('в')
    typeahead.type('в')
    typeahead.type('в')

    // «Вставить» → «Вырезать» → «Восстановить»: удвоенная буква не нашла бы ничего.
    expect(matched).toEqual([1, 2, 4])
  })

  /**
   * Регистр нормализуется до сравнения. Прежняя копия в `GrDropdown` сравнивала
   * сырой символ, поэтому повтор буквы с зажатым `Shift` уходил в поиск «Вв» и
   * молча промахивался.
   */
  it('повтор буквы, набранной с Shift, тоже ведёт к следующему совпадению', () => {
    const { typeahead, matched } = setup()

    typeahead.type('В')
    typeahead.type('в')

    expect(matched).toEqual([1, 2])
  })

  it('буквы в пределах паузы копятся в слово', () => {
    const { typeahead, at } = setup()

    typeahead.type('в')
    typeahead.type('о')

    expect(at()).toBe(4)
  })

  it('после паузы буфер начинается заново', () => {
    const { typeahead, at, matched } = setup()

    typeahead.type('п')
    expect(at()).toBe(3)

    vi.advanceTimersByTime(TYPEAHEAD_RESET_MS)
    typeahead.type('к')

    expect(matched).toEqual([3, 0])
  })

  it('промах ничего не двигает', () => {
    const { typeahead, matched } = setup()

    expect(typeahead.type('щ')).toBe(false)
    expect(matched).toEqual([])
  })

  it('поиск заворачивается через край набора', () => {
    const { typeahead, at } = setup(4)

    expect(typeahead.type('к')).toBe(true)
    expect(at()).toBe(0)
  })

  it('пустой набор не роняет поиск', () => {
    const typeahead = useTypeahead<string>({
      items: () => [],
      textOf: item => item,
      currentIndex: () => -1,
      onMatch: () => {},
    })

    expect(typeahead.type('к')).toBe(false)
  })

  /** На этом держится правило «`Space` при пустом буфере активирует пункт». */
  it('isEmpty отличает начало поиска от продолжения', () => {
    const { typeahead } = setup()

    expect(typeahead.isEmpty()).toBe(true)
    typeahead.type('в')
    expect(typeahead.isEmpty()).toBe(false)

    vi.advanceTimersByTime(TYPEAHEAD_RESET_MS)
    expect(typeahead.isEmpty()).toBe(true)
  })

  it('reset очищает буфер и снимает таймер', () => {
    const { typeahead, matched } = setup()

    typeahead.type('в')
    typeahead.reset()
    expect(typeahead.isEmpty()).toBe(true)

    // После сброса та же буква ищется с нуля, а не считается повтором.
    typeahead.type('в')
    expect(matched).toEqual([1, 2])
  })
})
