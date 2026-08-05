import { describe, expect, it } from 'vitest'

import { compareCells, isEmptyCell, sortRows } from '../grDataTableSort'

/**
 * Чистая логика — без монтирования: у сортировки крайние случаи, а не разметка.
 */
describe('сортировка GrDataTable', () => {
  it('пустым считает null, undefined и пробельную строку — но не 0 и не false', () => {
    expect(isEmptyCell(null)).toBe(true)
    expect(isEmptyCell(undefined)).toBe(true)
    expect(isEmptyCell('   ')).toBe(true)

    expect(isEmptyCell(0)).toBe(false)
    expect(isEmptyCell(false)).toBe(false)
    expect(isEmptyCell('0')).toBe(false)
  })

  // Раньше значение приводилось к числу через `Number(value)`, а он считает нулём
  // и `null`, и пустую строку: пустые ячейки оседали в середине числового ряда.
  it('держит пустые значения в конце в обоих направлениях', () => {
    const rows = [
      { id: 1, score: 5 },
      { id: 2, score: null },
      { id: 3, score: -10 },
      { id: 4, score: '' },
      { id: 5, score: 0 },
    ]

    expect(sortRows(rows, 'score', 'asc').map(r => r.id)).toEqual([3, 5, 1, 2, 4])
    expect(sortRows(rows, 'score', 'desc').map(r => r.id)).toEqual([1, 5, 3, 2, 4])
  })

  it('сравнивает числа численно, включая числовые строки', () => {
    const rows = [{ v: '100' }, { v: 9 }, { v: '20' }]
    expect(sortRows(rows, 'v', 'asc').map(r => r.v)).toEqual([9, '20', '100'])
  })

  it('сравнивает даты по времени, а не по строковому представлению', () => {
    const rows = [
      { id: 'b', at: new Date('2026-02-01') },
      { id: 'a', at: new Date('2025-12-31') },
      { id: 'c', at: new Date('2026-03-15') },
    ]

    expect(sortRows(rows, 'at', 'asc').map(r => r.id)).toEqual(['a', 'b', 'c'])
  })

  it('булево сравнивает как false < true', () => {
    const rows = [{ id: 1, done: true }, { id: 2, done: false }, { id: 3, done: true }]
    expect(sortRows(rows, 'done', 'asc').map(r => r.id)).toEqual([2, 1, 3])
  })

  it('строки сравнивает без учёта регистра и с числовой частью по значению', () => {
    const rows = [{ v: 'item 10' }, { v: 'Item 2' }, { v: 'item 1' }]
    expect(sortRows(rows, 'v', 'asc').map(r => r.v)).toEqual(['item 1', 'Item 2', 'item 10'])
  })

  it('смешанная колонка не роняет порядок: числа впереди, текст следом, пустые в конце', () => {
    const rows = [{ id: 1, v: 'draft' }, { id: 2, v: 3 }, { id: 3, v: null }, { id: 4, v: 1 }]
    const sorted = sortRows(rows, 'v', 'asc').map(r => r.id)

    expect(sorted.at(-1)).toBe(3)
    expect(sorted.indexOf(4)).toBeLessThan(sorted.indexOf(2))
  })

  it('не мутирует исходный массив', () => {
    const rows = [{ v: 2 }, { v: 1 }]
    const snapshot = [...rows]

    sortRows(rows, 'v', 'asc')
    expect(rows).toEqual(snapshot)
  })

  it('сохраняет порядок равных значений (стабильность)', () => {
    const rows = [{ id: 1, g: 'a' }, { id: 2, g: 'a' }, { id: 3, g: 'a' }]
    expect(sortRows(rows, 'g', 'desc').map(r => r.id)).toEqual([1, 2, 3])
  })

  it('принимает локаль сравнения', () => {
    // В шведском ä идёт после z, в немецком — рядом с a.
    expect(compareCells('ä', 'z', 'asc', 'sv')).toBeGreaterThan(0)
    expect(compareCells('ä', 'z', 'asc', 'de')).toBeLessThan(0)
  })
})
