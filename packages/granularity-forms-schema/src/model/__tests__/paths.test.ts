import { describe, expect, it } from 'vitest'

import {
  deleteAtPath,
  getAtPath,
  normalizeFieldPath,
  pathIndices,
  setAtPath,
  toInstancePath,
  toTemplatePath,
} from '../paths'

/**
 * Пути — фундамент пакета: по ним адресуются и данные, и описание. Ошибка здесь
 * не падает, а тихо промахивается — правило садится не на то поле, серверная
 * ошибка не находит своё.
 */
describe('шаблон и инстанс', () => {
  it('индексы подставляются снаружи внутрь', () => {
    expect(toInstancePath('items.*.tags.*', [2, 5])).toBe('items.2.tags.5')
  })

  it('нехватка индексов даёт первую строку, а не пустой сегмент', () => {
    expect(toInstancePath('items.*.name', [])).toBe('items.0.name')
  })

  it('обратный перевод стирает конкретную строку', () => {
    expect(toTemplatePath('items.12.name')).toBe('items.*.name')
    expect(pathIndices('items.12.tags.3')).toEqual([12, 3])
  })
})

describe('normalizeFieldPath', () => {
  /** Скобочную запись ядро молча прочтёт как ключ `"items[0]"` — и промахнётся. */
  it('скобочная запись Laravel приводится к точечной', () => {
    expect(normalizeFieldPath('items[0].name')).toBe('items.0.name')
    expect(normalizeFieldPath('map["key"].value')).toBe('map.key.value')
  })

  it('JSON Pointer разбирается вместе с экранированием', () => {
    expect(normalizeFieldPath('/items/0/name')).toBe('items.0.name')
    expect(normalizeFieldPath('/a~1b/c')).toBe('a/b.c')
    expect(normalizeFieldPath('/a~0b')).toBe('a~b')
  })

  it('префиксы JSON:API снимаются по списку', () => {
    expect(normalizeFieldPath('/data/attributes/email', { stripPrefixes: ['data', 'attributes'] }))
      .toBe('email')
  })

  it('уже нормальный путь не портится', () => {
    expect(normalizeFieldPath('user.address.city')).toBe('user.address.city')
  })
})

describe('чтение и запись', () => {
  it('читает и пишет вложенное', () => {
    const model: Record<string, unknown> = {}
    setAtPath(model, 'user.address.city', 'Тверь')

    expect(getAtPath(model, 'user.address.city')).toBe('Тверь')
  })

  /**
   * Единственное намеренное расхождение с ядром: его писатель создаёт объекты,
   * и `items.0.name` превратил бы список в `{ '0': … }` — форма сохранила бы
   * объект там, где сервер ждёт массив.
   */
  it('под числовым сегментом создаётся массив, а не объект', () => {
    const model: Record<string, unknown> = {}
    setAtPath(model, 'items.0.name', 'Первая')

    expect(Array.isArray(model.items)).toBe(true)
    expect(getAtPath(model, 'items.0.name')).toBe('Первая')
  })

  it('удаление строки массива сдвигает хвост, а не оставляет дыру', () => {
    const model: Record<string, unknown> = { items: [{ n: 1 }, { n: 2 }, { n: 3 }] }
    deleteAtPath(model, 'items.1')

    expect(model.items).toEqual([{ n: 1 }, { n: 3 }])
  })

  it('удаление ключа объекта не трогает соседей', () => {
    const model: Record<string, unknown> = { user: { a: 1, b: 2 } }
    deleteAtPath(model, 'user.a')

    expect(model.user).toEqual({ b: 2 })
  })
})
