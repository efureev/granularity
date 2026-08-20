import { runFieldRules } from '@feugene/granularity'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import type { GrSchemaUnionNode } from '../../../model'
import { expandFields, expandLeafFields, isResolvedUnion, unionOptions } from '../../../model'
import { compileRules } from '../../../validation'
import { parseZodSchema, zodAdapter } from '../index'

/**
 * Адаптер zod проверяется тем же кругом, что и JSON Schema: схема → модель →
 * правила → вердикт. Форма промежуточной модели внутренняя и меняться вправе.
 */
function fieldsOf(schema: Parameters<typeof parseZodSchema>[0], value: Record<string, unknown> = {}) {
  const model = parseZodSchema(schema)
  return { model, fields: expandLeafFields(model.root, value) }
}

async function verdictFor(
  schema: Parameters<typeof parseZodSchema>[0],
  data: Record<string, unknown>,
  path: string,
) {
  const { model } = fieldsOf(schema, data)
  // Все узлы, а не только листья: у массива свои границы длины, и правило
  // садится на него самого.
  const rules = compileRules(expandFields(model.root, data))

  return runFieldRules(
    path.split('.').reduce<unknown>((acc, key) => (acc as Record<string, unknown>)?.[key], data),
    rules[path] as never,
    data,
    (failure, rule) => rule.message ?? failure,
  )
}

describe('структура', () => {
  it('поля объекта становятся полями формы, обязательность — из optional', () => {
    const { fields } = fieldsOf(z.object({
      email: z.string(),
      nick: z.string().optional(),
    }))

    expect(fields.map(f => [f.name, f.node.required])).toEqual([['email', true], ['nick', false]])
  })

  it('вложенный объект даёт точечный путь', () => {
    const { fields } = fieldsOf(z.object({ user: z.object({ city: z.string() }) }))

    expect(fields.map(f => f.name)).toEqual(['user.city'])
  })

  it('массив объектов разворачивается по данным', () => {
    const { fields } = fieldsOf(
      z.object({ items: z.array(z.object({ name: z.string() })) }),
      { items: [{}, {}] },
    )

    expect(fields.map(f => f.name)).toEqual(['items.0.name', 'items.1.name'])
  })

  it('enum становится вариантами выбора', () => {
    const { fields } = fieldsOf(z.object({ role: z.enum(['admin', 'user']) }))

    expect(fields[0]!.node.options).toEqual([
      { value: 'admin', label: 'admin' },
      { value: 'user', label: 'user' },
    ])
  })

  it('nullable и default читаются с обёрток', () => {
    const { fields } = fieldsOf(z.object({
      note: z.string().nullable(),
      size: z.number().default(10),
    }))

    expect(fields[0]!.node.nullable).toBe(true)
    expect(fields[1]!.node.default).toBe(10)
  })

  it('описание схемы становится подсказкой поля', () => {
    const { fields } = fieldsOf(z.object({ email: z.string().describe('Куда слать письма') }))

    expect(fields[0]!.node.description).toBe('Куда слать письма')
  })

  it('число распознаётся числом, а дата — датой', () => {
    const { fields } = fieldsOf(z.object({ age: z.number(), born: z.date() }))

    expect(fields.map(f => f.node.kind)).toEqual(['number', 'date'])
  })
})

describe('ограничения доезжают до вердикта', () => {
  const schema = z.object({
    email: z.string().email(),
    nick: z.string().min(3).max(10),
    age: z.number().int().min(18),
    tags: z.array(z.string()).min(1),
  })

  it('формат письма', async () => {
    expect(await verdictFor(schema, { email: 'не почта' }, 'email')).toBeTruthy()
    expect(await verdictFor(schema, { email: 'a@b.co' }, 'email')).toBeUndefined()
  })

  it('длина строки', async () => {
    expect(await verdictFor(schema, { nick: 'ab' }, 'nick')).toBeTruthy()
    expect(await verdictFor(schema, { nick: 'абвг' }, 'nick')).toBeUndefined()
  })

  it('нижняя граница и целочисленность числа', async () => {
    expect(await verdictFor(schema, { age: 17 }, 'age')).toBeTruthy()
    expect(await verdictFor(schema, { age: 18.5 }, 'age')).toBeTruthy()
    expect(await verdictFor(schema, { age: 18 }, 'age')).toBeUndefined()
  })

  it('минимальная длина массива', async () => {
    expect(await verdictFor(schema, { tags: [] }, 'tags')).toBeTruthy()
    expect(await verdictFor(schema, { tags: ['x'] }, 'tags')).toBeUndefined()
  })

  /** Сообщение, написанное автором схемы для этого поля, сильнее нашего. */
  it('своё сообщение схемы сохраняется', () => {
    const { model } = fieldsOf(z.object({ nick: z.string().min(3, 'Слишком коротко') }))
    const node = model.root.fields[0]!

    expect(node.annotations?.['x-message']).toBe('Слишком коротко')
  })
})

describe('то, чего модель не выражает', () => {
  /** `.refine` не выразим правилами — узел помечается для полной проверки схемой. */
  it('refine помечает узел резидуальным', () => {
    const { model } = fieldsOf(z.object({ nick: z.string().refine(v => v !== 'admin') }))

    expect(model.root.fields[0]!.residual).toBe(true)
  })

  it('полная проверка схемой отдаёт ошибки по путям', async () => {
    const model = parseZodSchema(z.object({
      user: z.object({ age: z.number().min(18) }),
    }))

    const issues = await model.validate!({ user: { age: 10 } })

    expect(issues[0]?.path).toBe('user.age')
    expect(issues[0]?.message).toBeTruthy()
  })

  it('кросс-полевое условие ловится схемой, а не правилами', async () => {
    const schema = z.object({ from: z.number(), to: z.number() })
      .refine(value => value.to > value.from, { message: 'Конец раньше начала', path: ['to'] })

    const model = parseZodSchema(schema)
    const issues = await model.validate!({ from: 5, to: 1 })

    expect(issues).toEqual([{ path: 'to', message: 'Конец раньше начала', code: 'custom' }])
  })
})

describe('supports', () => {
  it('узнаёт схему zod и не путает с JSON Schema', () => {
    expect(zodAdapter.supports(z.object({}))).toBe(true)
    expect(zodAdapter.supports({ type: 'object', properties: {} })).toBe(false)
    expect(zodAdapter.supports(null)).toBe(false)
  })
})

describe('формат, объявленный самой схемой', () => {
  // В zod 4 `z.email()` — рекомендованная форма, и формат в ней лежит на схеме,
  // а не в списке проверок. Читай мы только проверки — современный идиом молча
  // терял бы тип поля, и почта приезжала бы обычной строкой.
  it('`z.email()` даёт тот же формат, что устаревшая `z.string().email()`', () => {
    const modern = parseZodSchema(z.object({ mail: z.email() }))
    const legacy = parseZodSchema(z.object({ mail: z.string().email() }))

    const formatOf = (model: ReturnType<typeof parseZodSchema>) =>
      model.root.fields?.find(field => field.key === 'mail')?.format

    expect(formatOf(modern)).toBe('email')
    expect(formatOf(legacy)).toBe('email')
  })

  it('работает и под обёрткой `optional`', () => {
    const model = parseZodSchema(z.object({ site: z.url().optional() }))
    const site = model.root.fields?.find(field => field.key === 'site')

    expect(site?.format).toBe('url')
    expect(site?.required).toBe(false)
  })

  it('чужой формат схемы не выдумывает известный', () => {
    const model = parseZodSchema(z.object({ id: z.string() }))

    expect(model.root.fields?.find(field => field.key === 'id')?.format).toBeUndefined()
  })
})

describe('ветвления', () => {
  const pickup = z.object({ kind: z.literal('pickup'), point: z.string() })
  const courier = z.object({ kind: z.literal('courier'), address: z.string() })

  /**
   * Разобранное объединение выражено моделью целиком, и полная проверка схемой
   * ему не нужна: `residual` тут — не «на всякий случай», а признак того, что
   * форма про узел ничего сказать не может.
   */
  it('`discriminatedUnion` разбирается и не уходит в резидуал', () => {
    const model = parseZodSchema(z.object({ delivery: z.discriminatedUnion('kind', [pickup, courier]) }))
    const node = model.root.fields.find(field => field.key === 'delivery')!

    expect(node.kind).toBe('union')
    expect(node.residual).toBe(false)
    expect(isResolvedUnion(node)).toBe(true)
    expect(unionOptions(node as GrSchemaUnionNode).map(option => option.value)).toEqual(['pickup', 'courier'])
    expect(model.warnings).toEqual([])
  })

  it('объединение объектов без дискриминатора остаётся резидуальным и предупреждает', () => {
    const model = parseZodSchema(z.object({
      payload: z.union([z.object({ a: z.string() }), z.object({ b: z.string() })]),
    }))
    const node = model.root.fields.find(field => field.key === 'payload')!

    expect(node.kind).toBe('union')
    expect(node.residual).toBe(true)
    expect(model.warnings.map(warning => warning.code)).toContain('unsupported-node')
  })
})

describe('свободные ключи', () => {
  it('`catchall` сохраняет схему значения', () => {
    const model = parseZodSchema(z.object({ title: z.string() }).catchall(z.number()))

    expect(model.root.additional).toBe(true)
    expect(model.root.additionalValue?.kind).toBe('number')
  })

  it('обычный объект свободных ключей не объявляет', () => {
    const model = parseZodSchema(z.object({ title: z.string() }))

    expect(model.root.additional).toBe(false)
    expect(model.root.additionalValue).toBeUndefined()
  })
})
