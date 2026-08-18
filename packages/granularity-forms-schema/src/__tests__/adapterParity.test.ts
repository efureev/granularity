import { runFieldRules } from '@feugene/granularity'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import { jsonSchemaAdapter } from '../adapters/json-schema'
import type { JsonSchemaDocument } from '../adapters/json-schema'
import { zodAdapter } from '../adapters/zod'
import { expandFields } from '../model'
import { compileRules } from '../validation'

/**
 * Паритет адаптеров.
 *
 * Пакет обещает, что источник схемы — деталь: одна и та же по смыслу схема,
 * записанная в zod и в JSON Schema, даёт одинаковую форму и одинаковый вердикт.
 * Без этого гейта два адаптера разъезжаются молча, и «у нас на бэкенде
 * OpenAPI» начинает означать другую валидацию, чем «у нас zod».
 */
const zodSchema = z.object({
  email: z.string().email(),
  nick: z.string().min(3).max(10),
  age: z.number().int().min(18).max(120),
  agree: z.boolean(),
  role: z.enum(['admin', 'user']),
  tags: z.array(z.string()).min(1),
  address: z.object({ city: z.string().min(2) }),
  items: z.array(z.object({ name: z.string().min(1), qty: z.number().int() })),
  note: z.string().optional(),
})

const jsonSchema: JsonSchemaDocument = {
  type: 'object',
  properties: {
    email: { type: 'string', format: 'email' },
    nick: { type: 'string', minLength: 3, maxLength: 10 },
    age: { type: 'integer', minimum: 18, maximum: 120 },
    agree: { type: 'boolean' },
    role: { type: 'string', enum: ['admin', 'user'] },
    tags: { type: 'array', items: { type: 'string' }, minItems: 1 },
    address: { type: 'object', properties: { city: { type: 'string', minLength: 2 } }, required: ['city'] },
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: { name: { type: 'string', minLength: 1 }, qty: { type: 'integer' } },
        required: ['name', 'qty'],
      },
    },
    note: { type: 'string' },
  },
  required: ['email', 'nick', 'age', 'agree', 'role', 'tags', 'address', 'items'],
}

const data = {
  email: 'a@b.co',
  nick: 'Ксения',
  age: 30,
  agree: true,
  role: 'admin',
  tags: ['x'],
  address: { city: 'Тверь' },
  items: [{ name: 'A', qty: 1 }],
  note: '',
}

function describeSchema(adapter: typeof zodAdapter | typeof jsonSchemaAdapter, schema: unknown) {
  const model = adapter.parse(schema as never)
  const fields = expandFields(model.root, data)

  return {
    model,
    fields,
    rules: compileRules(fields),
    /** Слепок структуры: вид, формат, обязательность и ограничения каждого поля. */
    shape: fields.map(field => ({
      name: field.name,
      kind: field.node.kind,
      format: field.node.format,
      required: field.node.required,
      options: field.node.options?.map(option => option.value),
      constraints: field.node.constraints,
    })),
  }
}

const fromZod = describeSchema(zodAdapter, zodSchema)
const fromJson = describeSchema(jsonSchemaAdapter, jsonSchema)

describe('структура', () => {
  it('оба адаптера дают одинаковый набор полей', () => {
    expect(fromZod.fields.map(f => f.name)).toEqual(fromJson.fields.map(f => f.name))
  })

  it('вид, формат, обязательность и ограничения совпадают поле в поле', () => {
    expect(fromZod.shape).toEqual(fromJson.shape)
  })

  it('ключи правил совпадают', () => {
    expect(Object.keys(fromZod.rules).sort()).toEqual(Object.keys(fromJson.rules).sort())
  })
})

describe('вердикт', () => {
  /**
   * Главное в паритете — не форма правил, а результат: на одних и тех же данных
   * обе схемы обязаны сказать одно и то же.
   */
  const cases: [string, string, unknown, boolean][] = [
    ['email пустой', 'email', '', false],
    ['email кривой', 'email', 'не почта', false],
    ['email верный', 'email', 'a@b.co', true],
    ['ник короткий', 'nick', 'ab', false],
    ['ник длинный', 'nick', 'абвгдеёжзийк', false],
    ['ник верный', 'nick', 'абвг', true],
    ['возраст мал', 'age', 17, false],
    ['возраст дробный', 'age', 18.5, false],
    ['возраст верный', 'age', 42, true],
    ['теги пусты', 'tags', [], false],
    ['теги есть', 'tags', ['a'], true],
    ['город короткий', 'address.city', 'Т', false],
    ['город верный', 'address.city', 'Тверь', true],
    ['имя позиции пусто', 'items.0.name', '', false],
    ['имя позиции есть', 'items.0.name', 'A', true],
    ['необязательная заметка пуста', 'note', '', true],
  ]

  it.each(cases)('%s — вердикт одинаков у обоих адаптеров', async (_label, path, value, expectedValid) => {
    const resolve = (failure: string, rule: { message?: string }) => rule.message ?? failure

    const zodVerdict = await runFieldRules(value, fromZod.rules[path] as never, data, resolve)
    const jsonVerdict = await runFieldRules(value, fromJson.rules[path] as never, data, resolve)

    expect(Boolean(zodVerdict)).toBe(Boolean(jsonVerdict))
    expect(zodVerdict === undefined).toBe(expectedValid)
  })
})

describe('своя схема остаётся источником правды', () => {
  it('zod проверяет то, что модель не выразила', async () => {
    const schema = z.object({ nick: z.string() }).refine(v => v.nick !== 'admin', {
      message: 'Имя занято',
      path: ['nick'],
    })

    const model = zodAdapter.parse(schema)
    const issues = await model.validate!({ nick: 'admin' })

    expect(issues).toEqual([{ path: 'nick', message: 'Имя занято', code: 'custom' }])
  })
})
