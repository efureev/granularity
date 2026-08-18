import { runFieldRules } from '@feugene/granularity'
import { describe, expect, it } from 'vitest'

import { expandFields, expandLeafFields } from '../../../model'
import { compileRules } from '../../../validation'
import { jsonSchemaAdapter, parseJsonSchema } from '../index'
import type { JsonSchemaDocument } from '../types'

/**
 * Адаптер проверяется по кругу «схема → модель → правила → вердикт»: именно он
 * и есть обещание пакета. Проверять форму промежуточной модели отдельно
 * бессмысленно — она внутренняя и вправе меняться.
 */
function fieldsOf(schema: JsonSchemaDocument, value: Record<string, unknown> = {}) {
  const model = parseJsonSchema(schema)
  return { model, fields: expandLeafFields(model.root, value) }
}

async function verdictFor(schema: JsonSchemaDocument, data: Record<string, unknown>, path: string) {
  const { model } = fieldsOf(schema, data)
  const rules = compileRules(expandFields(model.root, data))

  return runFieldRules(
    readPath(data, path),
    rules[path] as never,
    data,
    (failure, rule) => rule.message ?? failure,
  )
}

function readPath(value: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => (acc as Record<string, unknown>)?.[key], value)
}

describe('структура', () => {
  it('свойства становятся полями, обязательность приходит с уровня объекта', () => {
    const { fields } = fieldsOf({
      type: 'object',
      properties: { email: { type: 'string' }, nick: { type: 'string' } },
      required: ['email'],
    })

    expect(fields.map(f => [f.name, f.node.required])).toEqual([['email', true], ['nick', false]])
  })

  it('вложенный объект даёт точечный путь', () => {
    const { fields } = fieldsOf({
      type: 'object',
      properties: { user: { type: 'object', properties: { city: { type: 'string' } } } },
    })

    expect(fields.map(f => f.name)).toEqual(['user.city'])
  })

  it('массив объектов разворачивается по данным', () => {
    const { fields } = fieldsOf({
      type: 'object',
      properties: {
        items: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' } } } },
      },
    }, { items: [{}, {}] })

    expect(fields.map(f => f.name)).toEqual(['items.0.name', 'items.1.name'])
  })

  it('enum превращается в варианты выбора, а не в свободный ввод', () => {
    const { fields } = fieldsOf({
      type: 'object',
      properties: { role: { type: 'string', enum: ['admin', 'user'] } },
    })

    expect(fields[0]!.node.options).toEqual([
      { value: 'admin', label: 'admin' },
      { value: 'user', label: 'user' },
    ])
  })

  it('подписи вариантов берутся из расширения OpenAPI, если оно есть', () => {
    const { fields } = fieldsOf({
      type: 'object',
      properties: { role: { type: 'string', enum: ['admin', 'user'], 'x-enumNames': ['Админ', 'Пользователь'] } },
    })

    expect(fields[0]!.node.options?.map(o => o.label)).toEqual(['Админ', 'Пользователь'])
  })

  it('nullable читается и из массива типов, и из флага OpenAPI 3.0', () => {
    const { fields } = fieldsOf({
      type: 'object',
      properties: {
        a: { type: ['string', 'null'] },
        b: { type: 'string', nullable: true },
      },
    })

    expect(fields.map(f => f.node.nullable)).toEqual([true, true])
    expect(fields.map(f => f.node.kind)).toEqual(['string', 'string'])
  })
})

describe('ссылки и композиция', () => {
  it('внутренняя ссылка разрешается', () => {
    const { fields } = fieldsOf({
      type: 'object',
      properties: { user: { $ref: '#/$defs/user' } },
      $defs: { user: { type: 'object', properties: { city: { type: 'string' } } } },
    })

    expect(fields.map(f => f.name)).toEqual(['user.city'])
  })

  it('рекурсивная ссылка обрывается предупреждением, а не переполнением стека', () => {
    const model = parseJsonSchema({
      type: 'object',
      properties: { node: { $ref: '#/$defs/node' } },
      $defs: { node: { type: 'object', properties: { child: { $ref: '#/$defs/node' } } } },
    })

    expect(model.warnings.some(w => w.code === 'depth-exceeded')).toBe(true)
  })

  it('внешняя ссылка не молчит, а объясняет, что делать', () => {
    const model = parseJsonSchema({ type: 'object', properties: { a: { $ref: 'https://example.com/s.json' } } })

    expect(model.warnings[0]?.code).toBe('unresolved-ref')
    expect(model.warnings[0]?.message).toContain('разрешите схему')
  })

  it('allOf сливается: свойства объединяются, обязательность суммируется', () => {
    const { fields } = fieldsOf({
      allOf: [
        { type: 'object', properties: { a: { type: 'string' } }, required: ['a'] },
        { type: 'object', properties: { b: { type: 'string' } }, required: ['b'] },
      ],
    })

    expect(fields.map(f => [f.name, f.node.required])).toEqual([['a', true], ['b', true]])
  })

  /** Ветвление модель не выражает — узел помечается для полной проверки схемой. */
  it('oneOf помечает узел резидуальным', () => {
    const { fields } = fieldsOf({
      type: 'object',
      properties: { a: { type: 'string', oneOf: [{ const: 'x' }, { const: 'y' }] } },
    })

    expect(fields[0]!.node.residual).toBe(true)
  })
})

describe('ограничения доезжают до вердикта', () => {
  const schema: JsonSchemaDocument = {
    type: 'object',
    properties: {
      email: { type: 'string', format: 'email' },
      age: { type: 'integer', minimum: 18 },
      nick: { type: 'string', minLength: 3 },
      price: { type: 'number', exclusiveMinimum: 0 },
    },
    required: ['email'],
  }

  it('формат письма проверяется', async () => {
    expect(await verdictFor(schema, { email: 'не почта' }, 'email')).toBeTruthy()
    expect(await verdictFor(schema, { email: 'a@b.co' }, 'email')).toBeUndefined()
  })

  it('нижняя граница числа проверяется', async () => {
    expect(await verdictFor(schema, { age: 17 }, 'age')).toBeTruthy()
    expect(await verdictFor(schema, { age: 18 }, 'age')).toBeUndefined()
  })

  it('целочисленность приходит из type: integer', async () => {
    expect(await verdictFor(schema, { age: 18.5 }, 'age')).toBeTruthy()
  })

  it('длина строки проверяется', async () => {
    expect(await verdictFor(schema, { nick: 'ab' }, 'nick')).toBeTruthy()
  })

  it('строгая граница отличается от нестрогой', async () => {
    expect(await verdictFor(schema, { price: 0 }, 'price')).toBeTruthy()
    expect(await verdictFor(schema, { price: 0.01 }, 'price')).toBeUndefined()
  })

  /** Draft 4 писал `exclusiveMinimum: true` рядом с `minimum` — форма жива в реальных схемах. */
  it('булева форма exclusiveMinimum из draft 4 понимается', async () => {
    const draft4: JsonSchemaDocument = {
      type: 'object',
      properties: { n: { type: 'number', minimum: 0, exclusiveMinimum: true } },
    }

    expect(await verdictFor(draft4, { n: 0 }, 'n')).toBeTruthy()
    expect(await verdictFor(draft4, { n: 1 }, 'n')).toBeUndefined()
  })
})

describe('supports', () => {
  it('узнаёт схему по её ключам', () => {
    expect(jsonSchemaAdapter.supports({ type: 'object', properties: {} })).toBe(true)
    expect(jsonSchemaAdapter.supports({ $schema: 'https://json-schema.org/draft/2020-12/schema' })).toBe(true)
  })

  it('не путает со схемой zod и с обычными данными', () => {
    expect(jsonSchemaAdapter.supports({ _def: { typeName: 'ZodObject' } })).toBe(false)
    expect(jsonSchemaAdapter.supports({ email: 'a@b.c' })).toBe(false)
    expect(jsonSchemaAdapter.supports(null)).toBe(false)
  })
})

describe('корень не объект', () => {
  it('форма не падает, но говорит об этом', () => {
    const model = parseJsonSchema({ type: 'string' })

    expect(model.root.fields).toEqual([])
    expect(model.warnings[0]?.message).toContain('не объект')
  })
})
