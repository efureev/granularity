import { describe, expect, it } from 'vitest'

import { expandFields, expandLeafFields } from '../expand'
import { array, object, root, scalar, union, variant } from './nodes'

/**
 * Развёртка — место, где описание встречается с данными: узел элемента массива
 * один, а полей столько, сколько строк лежит в модели.
 */
const schema = root([
  scalar('email'),
  object('user', [scalar('city'), scalar('zip')]),
  array('items', object('*', [scalar('name'), scalar('qty', 'number')])),
])

describe('expandFields', () => {
  it('плоские и вложенные поля получают свой путь', () => {
    const fields = expandLeafFields(schema, { items: [] })

    expect(fields.map(f => f.name)).toEqual(['email', 'user.city', 'user.zip'])
  })

  it('массив разворачивается по фактической длине значения', () => {
    const fields = expandLeafFields(schema, { items: [{}, {}] })

    expect(fields.map(f => f.name)).toEqual([
      'email',
      'user.city',
      'user.zip',
      'items.0.name',
      'items.0.qty',
      'items.1.name',
      'items.1.qty',
    ])
  })

  /** Шаблон адресует описание, инстанс — данные; на этом разделении держится пакет. */
  it('шаблонный путь одинаков у всех строк, инстанс-путь — нет', () => {
    const fields = expandLeafFields(schema, { items: [{}, {}] })
    const names = fields.filter(f => f.templatePath === 'items.*.name')

    expect(names.map(f => f.name)).toEqual(['items.0.name', 'items.1.name'])
    expect(names.map(f => f.indices)).toEqual([[0], [1]])
  })

  it('контейнеры тоже попадают в список, но листьями не считаются', () => {
    const all = expandFields(schema, { items: [{}] })
    const containers = all.filter(f => !f.leaf).map(f => f.name)

    expect(containers).toEqual(['user', 'items', 'items.0'])
  })

  it('include отсекает поддерево целиком', () => {
    const fields = expandLeafFields(schema, { items: [{}] }, {
      include: node => node.key !== 'user',
    })

    expect(fields.map(f => f.name)).toEqual(['email', 'items.0.name', 'items.0.qty'])
  })

  it('значение не массив — строк нет, но и падения нет', () => {
    const fields = expandLeafFields(schema, { items: null })

    expect(fields.map(f => f.name)).toEqual(['email', 'user.city', 'user.zip'])
  })

  it('родитель и глубина заполняются для вложенных', () => {
    const fields = expandLeafFields(schema, { items: [{}] })
    const qty = fields.find(f => f.name === 'items.0.qty')!

    expect(qty.parent).toBe('items.0')
    expect(qty.depth).toBe(2)
  })

  /** Рекурсивная схема иначе развернулась бы до переполнения стека. */
  it('глубина обхода ограничена', () => {
    const deep = root([object('a', [object('b', [object('c', [scalar('d')])])])])
    const fields = expandLeafFields(deep, {}, { maxDepth: 2 })

    expect(fields).toEqual([])
  })
})

/**
 * Вариант объединения — не самостоятельное поле, а его содержимое: он
 * посещается под именем самого объединения. Раньше вариант приходил в список
 * отдельным инстансом с тем же `name`, и `:key="field.name"` давал в шаблоне
 * два узла с одинаковым ключом.
 */
describe('развёртка ветвления', () => {
  const branching = root([
    scalar('title'),
    union('delivery', [
      variant('pickup', [scalar('point')]),
      variant('courier', [scalar('address')]),
    ]),
  ])

  it('объединение приходит одним инстансом, а не двумя', () => {
    const names = expandFields(branching, { delivery: { kind: 'pickup', point: '' } }).map(field => field.name)

    expect(names.filter(name => name === 'delivery')).toHaveLength(1)
    expect(new Set(names).size).toBe(names.length)
  })

  it('в корне лежит само объединение, а поля варианта — под ним', () => {
    const fields = expandFields(branching, { delivery: { kind: 'courier', address: '' } })

    expect(fields.filter(field => field.parent === '').map(field => field.name)).toEqual(['title', 'delivery'])
    expect(fields.filter(field => field.parent === 'delivery').map(field => field.name))
      .toEqual(['delivery.kind', 'delivery.address'])
  })

  it('смена дискриминатора меняет набор развёрнутых полей', () => {
    const of = (kind: string) => expandLeafFields(branching, { delivery: { kind } }).map(field => field.name)

    expect(of('pickup')).toEqual(['title', 'delivery.kind', 'delivery.point'])
    expect(of('courier')).toEqual(['title', 'delivery.kind', 'delivery.address'])
  })
})
