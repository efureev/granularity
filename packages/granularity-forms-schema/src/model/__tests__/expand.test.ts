import { describe, expect, it } from 'vitest'

import { expandFields, expandLeafFields } from '../expand'
import { array, object, root, scalar } from './nodes'

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
