import { describe, expect, it } from 'vitest'

import {
  getByPath,
  isEmpty,
  rulesForTrigger,
  rulesRequired,
  runFieldRules,
  setByPath,
  toRuleArray,
  type GrFormMessageResolver,
  type GrFormRule,
} from '../validation'

// Простой резолвер: kind + params, чтобы проверять какое правило сработало.
const resolve: GrFormMessageResolver = (kind, rule, params) =>
  rule.message ?? `${kind}:${JSON.stringify(params)}`

async function run(value: unknown, rules: GrFormRule[], model: Record<string, unknown> = {}) {
  return runFieldRules(value, rules, model, resolve)
}

describe('GrForm validation engine', () => {
  it('isEmpty: null/undefined/пустая строка/пробелы/пустой массив', () => {
    expect(isEmpty(null)).toBe(true)
    expect(isEmpty(undefined)).toBe(true)
    expect(isEmpty('')).toBe(true)
    expect(isEmpty('   ')).toBe(true)
    expect(isEmpty([])).toBe(true)
    expect(isEmpty('x')).toBe(false)
    expect(isEmpty(0)).toBe(false)
    expect(isEmpty(false)).toBe(false)
    expect(isEmpty(['a'])).toBe(false)
  })

  it('required срабатывает на пустом значении', async () => {
    expect(await run('', [{ required: true }])).toBe('required:{}')
    expect(await run('ok', [{ required: true }])).toBeUndefined()
  })

  it('пустое необязательное значение проходит остальные проверки', async () => {
    expect(await run('', [{ min: 3, type: 'email' }])).toBeUndefined()
  })

  it('min/max/len по длине строки', async () => {
    expect(await run('ab', [{ min: 3 }])).toBe('min:{"min":3}')
    expect(await run('abcd', [{ max: 3 }])).toBe('max:{"max":3}')
    expect(await run('abc', [{ len: 3 }])).toBeUndefined()
    expect(await run('ab', [{ len: 3 }])).toBe('len:{"len":3}')
  })

  it('min/max по числовому значению', async () => {
    expect(await run(5, [{ min: 10 }])).toBe('min:{"min":10}')
    expect(await run(15, [{ max: 10 }])).toBe('max:{"max":10}')
    expect(await run(7, [{ min: 5, max: 10 }])).toBeUndefined()
  })

  it('pattern и type=email', async () => {
    expect(await run('abc', [{ pattern: /^\d+$/ }])).toBe('pattern:{}')
    expect(await run('123', [{ pattern: /^\d+$/ }])).toBeUndefined()
    expect(await run('not-an-email', [{ type: 'email' }])).toBe('email:{}')
    expect(await run('a@b.co', [{ type: 'email' }])).toBeUndefined()
  })

  it('кастомный валидатор: false → дефолт, строка → её текст, true → ок', async () => {
    expect(await run('x', [{ validator: () => false }])).toBe('invalid:{}')
    expect(await run('x', [{ validator: () => false, message: 'нельзя' }])).toBe('нельзя')
    expect(await run('x', [{ validator: () => 'своя ошибка' }])).toBe('своя ошибка')
    expect(await run('x', [{ validator: () => true }])).toBeUndefined()
  })

  it('async-валидатор и доступ к model', async () => {
    const rule: GrFormRule = {
      validator: async (value, model) => (value === model.confirm ? true : 'не совпадает'),
    }
    expect(await run('a', [rule], { confirm: 'a' })).toBeUndefined()
    expect(await run('a', [rule], { confirm: 'b' })).toBe('не совпадает')
  })

  it('возвращает первую ошибку по порядку правил', async () => {
    expect(await run('', [{ required: true }, { min: 3 }])).toBe('required:{}')
  })

  it('rulesForTrigger: undefined-триггер = все; конкретный = свои + без триггера', () => {
    const rules: GrFormRule[] = [
      { required: true }, // без trigger
      { min: 3, trigger: 'blur' },
      { max: 5, trigger: 'change' },
    ]
    expect(rulesForTrigger(rules)).toHaveLength(3)
    expect(rulesForTrigger(rules, 'blur')).toHaveLength(2) // required + blur
    expect(rulesForTrigger(rules, 'change')).toHaveLength(2) // required + change
  })

  it('rulesRequired / toRuleArray', () => {
    expect(rulesRequired([{ min: 1 }])).toBe(false)
    expect(rulesRequired([{ required: true }])).toBe(true)
    expect(toRuleArray(undefined)).toEqual([])
    expect(toRuleArray({ required: true })).toHaveLength(1)
    expect(toRuleArray([{ required: true }, { min: 1 }])).toHaveLength(2)
  })

  it('getByPath / setByPath поддерживают dot-path', () => {
    const obj = { a: 1, nested: { city: 'X' } }
    expect(getByPath(obj, 'a')).toBe(1)
    expect(getByPath(obj, 'nested.city')).toBe('X')
    expect(getByPath(obj, 'nested.missing')).toBeUndefined()
    setByPath(obj, 'nested.city', 'Y')
    expect(obj.nested.city).toBe('Y')
    setByPath(obj, 'deep.new.key', 42)
    expect((obj as Record<string, any>).deep.new.key).toBe(42)
  })
})
