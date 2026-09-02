import { describe, expect, it } from 'vitest'

import {
  edgeTarget,
  insertKeys,
  keyAfterRemoval,
  normalizeKeys,
  orderedBy,
  removeKeys,
  splitByModel,
  stepTarget,
} from '../transferModel'

interface Row { id: string, label: string }

const rows: Row[] = [
  { id: 'a', label: 'A' },
  { id: 'b', label: 'B' },
  { id: 'c', label: 'C' },
  { id: 'd', label: 'D' },
]

const keyOf = (row: Row): string => row.id

describe('normalizeKeys', () => {
  it('снимает дубли, первый выигрывает', () => {
    expect(normalizeKeys(['a', 'b', 'a', 'c', 'b'])).toEqual(['a', 'b', 'c'])
  })

  it('не путает строку и число', () => {
    expect(normalizeKeys(['1', 1])).toEqual(['1', 1])
  })
})

describe('splitByModel', () => {
  it('правая панель идёт в порядке модели, левая — в порядке каталога', () => {
    const split = splitByModel(rows, keyOf, ['c', 'a'])

    expect(split.target.map(keyOf)).toEqual(['c', 'a'])
    expect(split.source.map(keyOf)).toEqual(['b', 'd'])
  })

  it('ключ модели, которого нет в каталоге, сохраняется отдельно, а не теряется', () => {
    const split = splitByModel(rows, keyOf, ['b', 'ghost'])

    expect(split.target.map(keyOf)).toEqual(['b'])
    expect(split.unresolved).toEqual(['ghost'])
  })

  it('дубль каталога рисуется один раз и сообщается', () => {
    const withDupe: Row[] = [...rows, { id: 'a', label: 'A-двойник' }]
    const split = splitByModel(withDupe, keyOf, [])

    expect(split.source.map(keyOf)).toEqual(['a', 'b', 'c', 'd'])
    expect(split.source[0].label).toBe('A')
    expect(split.duplicated).toEqual(['a'])
  })

  it('дубли внутри модели схлопываются', () => {
    const split = splitByModel(rows, keyOf, ['a', 'a', 'b'])

    expect(split.target.map(keyOf)).toEqual(['a', 'b'])
  })

  it('пустые входы дают пустые панели', () => {
    const split = splitByModel([], keyOf, [])

    expect(split.source).toEqual([])
    expect(split.target).toEqual([])
  })

  it('вся модель — левая панель пуста', () => {
    const split = splitByModel(rows, keyOf, ['a', 'b', 'c', 'd'])

    expect(split.source).toEqual([])
    expect(split.target).toHaveLength(4)
  })
})

describe('orderedBy', () => {
  it('раскладывает по эталону, неизвестное — в конец', () => {
    expect(orderedBy(['a', 'b', 'c'], new Set(['c', 'z', 'a']))).toEqual(['a', 'c', 'z'])
  })
})

describe('removeKeys', () => {
  it('изымает блок, не трогая вход', () => {
    const order = ['a', 'b', 'c']
    expect(removeKeys(order, ['b'])).toEqual(['a', 'c'])
    expect(order).toEqual(['a', 'b', 'c'])
  })
})

describe('insertKeys', () => {
  it('ставит блок перед ключом', () => {
    expect(insertKeys(['a', 'b', 'c'], ['x'], 'b')).toEqual(['a', 'x', 'b', 'c'])
  })

  it('null ставит в конец', () => {
    expect(insertKeys(['a', 'b'], ['x'], null)).toEqual(['a', 'b', 'x'])
  })

  it('неизвестный ориентир — тоже в конец', () => {
    expect(insertKeys(['a', 'b'], ['x'], 'ghost')).toEqual(['a', 'b', 'x'])
  })

  it('перестановка внутри своего списка не требует поправки на вынутый элемент', () => {
    // Ровно тот случай, ради которого `insertionIndex` носит поправку.
    expect(insertKeys(['a', 'b', 'c'], ['a'], 'c')).toEqual(['b', 'a', 'c'])
    expect(insertKeys(['a', 'b', 'c'], ['c'], 'a')).toEqual(['c', 'a', 'b'])
  })

  it('переносит блок целиком, сохраняя его порядок', () => {
    expect(insertKeys(['a', 'b', 'c', 'd'], ['d', 'b'], 'a')).toEqual(['d', 'b', 'a', 'c'])
  })

  it('пустой блок оставляет порядок как был', () => {
    expect(insertKeys(['a', 'b'], [], 'a')).toEqual(['a', 'b'])
  })
})

describe('stepTarget', () => {
  it('двигает блок на позицию', () => {
    expect(stepTarget(['a', 'b', 'c'], ['a'], 1)).toBe('c')
    expect(stepTarget(['a', 'b', 'c'], ['c'], -1)).toBe('b')
  })

  it('у края возвращает undefined', () => {
    expect(stepTarget(['a', 'b', 'c'], ['a'], -1)).toBeUndefined()
    expect(stepTarget(['a', 'b', 'c'], ['c'], 1)).toBeUndefined()
  })

  it('в самый конец даёт null', () => {
    expect(stepTarget(['a', 'b', 'c'], ['b'], 1)).toBeNull()
  })

  it('рассыпанный блок схлопывается и двигается целиком', () => {
    expect(stepTarget(['a', 'b', 'c', 'd'], ['a', 'c'], 1)).toBe('d')
  })

  it('пустой блок и неизвестные ключи — некуда двигаться', () => {
    expect(stepTarget(['a'], [], 1)).toBeUndefined()
    expect(stepTarget(['a'], ['ghost'], 1)).toBeUndefined()
  })
})

describe('edgeTarget', () => {
  it('в начало — перед первой уцелевшей', () => {
    expect(edgeTarget(['a', 'b', 'c'], ['c'], 'start')).toBe('a')
  })

  it('в конец — null', () => {
    expect(edgeTarget(['a', 'b', 'c'], ['a'], 'end')).toBeNull()
  })

  it('блок и есть весь список — двигаться некуда', () => {
    expect(edgeTarget(['a'], ['a'], 'start')).toBeUndefined()
    expect(edgeTarget(['a'], ['a'], 'end')).toBeUndefined()
  })
})

describe('keyAfterRemoval', () => {
  it('фокус остаётся, если строка уцелела', () => {
    expect(keyAfterRemoval(['a', 'b', 'c'], ['a'], 'c')).toBe('c')
  })

  it('уехала сфокусированная — берём следующую ниже', () => {
    expect(keyAfterRemoval(['a', 'b', 'c'], ['b'], 'b')).toBe('c')
  })

  it('ниже ничего не осталось — берём выше', () => {
    expect(keyAfterRemoval(['a', 'b', 'c'], ['b', 'c'], 'c')).toBe('a')
  })

  it('панель опустела — фокусировать нечего', () => {
    expect(keyAfterRemoval(['a'], ['a'], 'a')).toBeUndefined()
  })
})
