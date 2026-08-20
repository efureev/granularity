import { describe, expect, it } from 'vitest'

import { createInitialItem, createInitialModel, defaultValueFor, emptyModelFor, ensureShape } from '../defaults'
import { array, object, root, scalar, union, variant } from './nodes'

/**
 * Начальное значение выбирается не по вкусу, а по тому, как ядро считает поле
 * пустым: `null`, `undefined`, пустая строка и пустой массив — пусты, а `0` и
 * `false` — нет. Перепутанный дефолт даёт `required`, проходящий на нетронутом
 * поле, — ошибку, которую замечают уже в проде.
 */
describe('defaultValueFor', () => {
  it('строка пуста, а не null: поле остаётся управляемым', () => {
    expect(defaultValueFor(scalar('a'))).toBe('')
  })

  it('число — null, потому что ноль ядро пустым не считает', () => {
    expect(defaultValueFor(scalar('a', 'number'))).toBeNull()
  })

  it('булев — false: чекбоксу нужен булев', () => {
    expect(defaultValueFor(scalar('a', 'boolean'))).toBe(false)
  })

  it('выбор из вариантов пуст как null, а не пустой строкой', () => {
    const node = scalar('a', 'string', { options: [{ value: 'x', label: 'X' }] })

    expect(defaultValueFor(node)).toBeNull()
  })

  it('массив — пустой массив, и это обязательно заранее', () => {
    expect(defaultValueFor(array('a', scalar('*')))).toEqual([])
  })

  it('дата и файл — null, но никогда undefined', () => {
    expect(defaultValueFor(scalar('a', 'date'))).toBeNull()
    expect(defaultValueFor(scalar('a', 'file'))).toBeNull()
  })

  it('объект разворачивается рекурсивно', () => {
    const node = object('a', [scalar('s'), scalar('n', 'number')])

    expect(defaultValueFor(node)).toEqual({ s: '', n: null })
  })

  it('умолчание схемы сильнее типового', () => {
    expect(defaultValueFor(scalar('a', 'number', { default: 42 }))).toBe(42)
  })

  it('умолчание-объект клонируется, а не делится между формами', () => {
    const shared = { nested: { flag: true } }
    const first = defaultValueFor(scalar('a', 'unknown', { default: shared })) as typeof shared
    first.nested.flag = false

    expect(shared.nested.flag).toBe(true)
  })

  it('единственное допустимое значение становится начальным', () => {
    expect(defaultValueFor(scalar('a', 'boolean', { const: true }))).toBe(true)
  })
})

describe('createInitialModel', () => {
  const schema = root([
    scalar('email'),
    scalar('age', 'number'),
    object('user', [scalar('city')]),
    array('items', object('*', [scalar('name')])),
  ])

  it('пустая модель собирается целиком', () => {
    expect(emptyModelFor(schema)).toEqual({ email: '', age: null, user: { city: '' }, items: [] })
  })

  it('существующие данные сильнее умолчаний', () => {
    const model = createInitialModel(schema, { email: 'a@b.c', items: [{ name: 'Первая' }] })

    expect(model.email).toBe('a@b.c')
    expect(model.items).toEqual([{ name: 'Первая' }])
  })

  /** В модели редактируемой сущности лежат `id` и служебные поля стора. */
  it('ключи вне схемы сохраняются', () => {
    const model = createInitialModel(schema, { id: 17, createdAt: '2026-01-01' })

    expect(model.id).toBe(17)
    expect(model.createdAt).toBe('2026-01-01')
  })

  it('частично заполненный вложенный объект дополняется', () => {
    const model = createInitialModel(schema, { user: {} })

    expect(model.user).toEqual({ city: '' })
  })
})

describe('createInitialItem', () => {
  it('новая строка повторителя собирается по узлу элемента', () => {
    const item = object('*', [scalar('name'), scalar('qty', 'number')])

    expect(createInitialItem(item)).toEqual({ name: '', qty: null })
  })
})

describe('ensureShape', () => {
  const schema = root([
    scalar('email'),
    object('user', [scalar('city')]),
    array('items', object('*', [scalar('name'), scalar('qty', 'number')])),
  ])

  it('досоздаёт контейнеры и заполняет листья', () => {
    const model: Record<string, unknown> = {}
    ensureShape(model, schema)

    expect(model).toEqual({ email: '', user: { city: '' }, items: [] })
  })

  it('не затирает уже заполненное', () => {
    const model: Record<string, unknown> = { email: 'a@b.c', user: { city: 'Тверь' } }
    ensureShape(model, schema)

    expect(model.email).toBe('a@b.c')
    expect(model.user).toEqual({ city: 'Тверь' })
  })

  /**
   * Строка, пришедшая с сервера без части полей, иначе отдала бы контролу
   * `undefined` — а контрол без значения перестаёт быть управляемым.
   */
  it('дополняет неполные строки массива', () => {
    const model: Record<string, unknown> = { items: [{ name: 'A' }] }
    ensureShape(model, schema)

    expect((model.items as Record<string, unknown>[])[0]).toEqual({ name: 'A', qty: null })
  })

  it('массив, оказавшийся объектом, восстанавливается массивом', () => {
    const model: Record<string, unknown> = { items: { 0: {} } }
    ensureShape(model, schema)

    expect(Array.isArray(model.items)).toBe(true)
  })
})

/**
 * Ветвление без стартового значения не появляется на экране вовсе: `expand`
 * уходит по «значение не объект» и не разворачивает ни одного варианта. Поэтому
 * дефолт объединения — не `null`, а форма первого варианта.
 */
describe('defaultValueFor: ветвление', () => {
  it('разобранное объединение стартует первым вариантом', () => {
    const node = union('delivery', [
      variant('pickup', [scalar('point')]),
      variant('courier', [scalar('address')]),
    ])

    expect(defaultValueFor(node)).toEqual({ kind: 'pickup', point: '' })
  })

  it('без дискриминатора выбирать нечего — значения нет', () => {
    const node = union('payload', [variant('a', []), variant('b', [])], { discriminator: undefined })

    expect(defaultValueFor(node)).toBeNull()
  })
})
