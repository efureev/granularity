import { describe, expect, it } from 'vitest'

import {
  filterCommandItems,
  findDuplicateCommandIds,
  groupCommandItems,
  matchCommandItem,
  splitCommandMatch,
  withRecentCommands,
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

describe('splitCommandMatch', () => {
  it('режет текст по вхождению запроса, сохраняя регистр исходника', () => {
    expect(splitCommandMatch('Новый Документ', 'нов')).toEqual([
      { text: 'Нов', match: true },
      { text: 'ый Документ', match: false },
    ])
  })

  it('находит все вхождения, а не только первое', () => {
    expect(splitCommandMatch('bab', 'b')).toEqual([
      { text: 'b', match: true },
      { text: 'a', match: false },
      { text: 'b', match: true },
    ])
  })

  it('без совпадения и без запроса отдаёт один сегмент — подсвечивать нечего', () => {
    // Свой `filter` вправе матчить по `keywords`, и тогда в метке совпадения нет.
    expect(splitCommandMatch('Открыть…', 'файл')).toEqual([{ text: 'Открыть…', match: false }])
    expect(splitCommandMatch('Открыть…', '   ')).toEqual([{ text: 'Открыть…', match: false }])
  })
})

describe('withRecentCommands', () => {
  it('поднимает недавние наверх в порядке recentIds и убирает их снизу', () => {
    const groups = groupCommandItems(items)
    const result = withRecentCommands(groups, items, ['theme', 'new'], 'Недавние')

    expect(result[0].name).toBe('Недавние')
    expect(result[0].items.map(i => i.id)).toEqual(['theme', 'new'])

    // Дубликатов быть не может: `id` один, а DOM-id из него же.
    const rest = result.slice(1).flatMap(g => g.items.map(i => i.id))
    expect(rest).not.toContain('theme')
    expect(rest).not.toContain('new')
  })

  it('группа, опустевшая после переноса, исчезает', () => {
    const groups = groupCommandItems(items)
    const result = withRecentCommands(groups, items, ['new', 'open'], 'Недавние')

    // Группа «Файл» опустела и исчезла; безымянная группа остаётся на месте.
    expect(result.map(g => g.name)).not.toContain('Файл')
    expect(result[0].name).toBe('Недавние')
  })

  it('неизвестные и повторяющиеся id игнорируются, пустой список ничего не меняет', () => {
    const groups = groupCommandItems(items)

    expect(withRecentCommands(groups, items, ['ghost'], 'Недавние')).toBe(groups)
    expect(withRecentCommands(groups, items, [], 'Недавние')).toBe(groups)
    expect(withRecentCommands(groups, items, ['new', 'new'], 'Недавние')[0].items).toHaveLength(1)
  })
})

describe('findDuplicateCommandIds', () => {
  it('возвращает только повторяющиеся идентификаторы', () => {
    expect(findDuplicateCommandIds(items)).toEqual([])
    expect(findDuplicateCommandIds([...items, items[0]])).toEqual(['new'])
  })
})
