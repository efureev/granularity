import { describe, expect, it } from 'vitest'

import {
  filterCommandItems,
  groupCommandItems,
  matchCommandItem,
  type GrCommandItem,
} from '../filtering'

const items: GrCommandItem[] = [
  { id: 'new', label: 'Новый документ', group: 'Файл', keywords: ['create', 'создать'] },
  { id: 'open', label: 'Открыть…', description: 'Последние файлы', group: 'Файл' },
  { id: 'theme', label: 'Сменить тему', group: 'Настройки' },
  { id: 'logout', label: 'Выйти' },
]

describe('matchCommandItem', () => {
  it('ищет по метке, описанию, группе и ключевым словам без учёта регистра', () => {
    expect(matchCommandItem(items[0], 'НОВЫЙ')).toBe(true)
    expect(matchCommandItem(items[0], 'create')).toBe(true)
    expect(matchCommandItem(items[1], 'последние')).toBe(true)
    expect(matchCommandItem(items[2], 'настрой')).toBe(true)
    expect(matchCommandItem(items[2], 'документ')).toBe(false)
  })

  it('пустой запрос совпадает со всем', () => {
    expect(matchCommandItem(items[3], '   ')).toBe(true)
  })
})

describe('filterCommandItems', () => {
  it('возвращает исходный список для пустого запроса', () => {
    expect(filterCommandItems(items, '')).toBe(items)
  })

  it('фильтрует по умолчанию и принимает кастомный матчер', () => {
    expect(filterCommandItems(items, 'файл').map(i => i.id)).toEqual(['new', 'open'])
    expect(filterCommandItems(items, 'ый', (item, q) => item.label.endsWith(q)).map(i => i.id))
      .toEqual([])
  })
})

describe('groupCommandItems', () => {
  it('группирует, сохраняя порядок первого появления группы', () => {
    const groups = groupCommandItems(items)

    expect(groups.map(g => g.name)).toEqual(['Файл', 'Настройки', undefined])
    expect(groups[0].items.map(i => i.id)).toEqual(['new', 'open'])
    expect(groups[2].items.map(i => i.id)).toEqual(['logout'])
  })

  it('команды одной группы собираются вместе даже вразбивку', () => {
    const groups = groupCommandItems([items[0], items[2], items[1]])

    expect(groups.map(g => g.name)).toEqual(['Файл', 'Настройки'])
    expect(groups[0].items.map(i => i.id)).toEqual(['new', 'open'])
  })

  it('пустой список даёт пустой результат', () => {
    expect(groupCommandItems([])).toEqual([])
  })
})
