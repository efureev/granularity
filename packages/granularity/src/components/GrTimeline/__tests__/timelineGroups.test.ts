import { describe, expect, it } from 'vitest'

import { groupTimelineItems } from '../timelineGroups'

interface Event {
  id: number
  day?: string
}

const events: Event[] = [
  { id: 1, day: '12 августа' },
  { id: 2, day: '12 августа' },
  { id: 3, day: '11 августа' },
]

function shape<T extends { id: number }>(groups: ReturnType<typeof groupTimelineItems<T>>) {
  return groups.map(group => ({
    key: group.key,
    ids: group.entries.map(entry => entry.item.id),
    indexes: group.entries.map(entry => entry.index),
  }))
}

describe('groupTimelineItems', () => {
  it('без `groupBy` отдаёт одну безымянную группу', () => {
    expect(shape(groupTimelineItems(events))).toEqual([
      { key: '', ids: [1, 2, 3], indexes: [0, 1, 2] },
    ])
  })

  it('пустой набор не даёт пустой группы', () => {
    expect(groupTimelineItems([])).toEqual([])
    expect(groupTimelineItems([], 'day')).toEqual([])
  })

  it('режет по полю, сохраняя порядок событий и порядок групп', () => {
    expect(shape(groupTimelineItems(events, 'day'))).toEqual([
      { key: '12 августа', ids: [1, 2], indexes: [0, 1] },
      { key: '11 августа', ids: [3], indexes: [2] },
    ])
  })

  it('индексы остаются позициями в исходном наборе', () => {
    // Ключи `v-for` считаются от них: сквозная нумерация внутри группы дала бы
    // одинаковые ключи в разных группах.
    const groups = groupTimelineItems(events, 'day')

    expect(groups[1].entries[0].index).toBe(2)
  })

  it('разорванная группа собирается в одну', () => {
    const items = [{ id: 1, day: 'a' }, { id: 2, day: 'b' }, { id: 3, day: 'a' }]

    expect(shape(groupTimelineItems(items, 'day'))).toEqual([
      { key: 'a', ids: [1, 3], indexes: [0, 2] },
      { key: 'b', ids: [2], indexes: [1] },
    ])
  })

  it('пустое поле даёт группу без заголовка, а не надпись «undefined»', () => {
    const items = [{ id: 1 }, { id: 2, day: 'a' }]

    expect(shape(groupTimelineItems(items, 'day'))).toEqual([
      { key: '', ids: [1], indexes: [0] },
      { key: 'a', ids: [2], indexes: [1] },
    ])
  })

  it('функция получает пункт и его позицию', () => {
    const seen: number[] = []
    const groups = groupTimelineItems(events, (item, index) => {
      seen.push(index)
      return item.id % 2 === 0 ? 'чётные' : 'нечётные'
    })

    expect(seen).toEqual([0, 1, 2])
    expect(shape(groups)).toEqual([
      { key: 'нечётные', ids: [1, 3], indexes: [0, 2] },
      { key: 'чётные', ids: [2], indexes: [1] },
    ])
  })

  it('нестроковый ключ приводится к строке', () => {
    const items = [{ id: 1 }, { id: 2 }]

    expect(groupTimelineItems(items, item => String(item.id)).map(group => group.key))
      .toEqual(['1', '2'])
  })

  it('исходный массив не мутируется', () => {
    const items = [...events]
    groupTimelineItems(items, 'day')

    expect(items).toEqual(events)
  })
})
