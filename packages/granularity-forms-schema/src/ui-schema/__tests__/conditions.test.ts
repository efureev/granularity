import { describe, expect, it } from 'vitest'

import {
  conditionDependencies,
  createConditionContext,
  evaluateCondition,
  resolveConditionPath,
} from '../conditions'
import { applyOrder, humanize, mergeUiSchema } from '../resolve'

const model = {
  type: 'company',
  age: 30,
  agree: false,
  note: '',
  items: [{ kind: 'book', price: 10 }, { kind: 'disc', price: 0 }],
}

const ctx = (name = '') => createConditionContext(model, name, [])

describe('условия', () => {
  it('равенство и вхождение', () => {
    expect(evaluateCondition({ path: 'type', eq: 'company' }, ctx())).toBe(true)
    expect(evaluateCondition({ path: 'type', in: ['person', 'company'] }, ctx())).toBe(true)
    expect(evaluateCondition({ path: 'type', notIn: ['company'] }, ctx())).toBe(false)
  })

  it('числовые сравнения', () => {
    expect(evaluateCondition({ path: 'age', gte: 18 }, ctx())).toBe(true)
    expect(evaluateCondition({ path: 'age', lt: 18 }, ctx())).toBe(false)
  })

  /** Пустота считается по правилу ядра: `false` и `0` пустыми не считаются. */
  it('пустота совпадает с правилом формы', () => {
    expect(evaluateCondition({ path: 'note', empty: true }, ctx())).toBe(true)
    expect(evaluateCondition({ path: 'agree', empty: true }, ctx())).toBe(false)
    expect(evaluateCondition({ path: 'items.1.price', empty: true }, ctx())).toBe(false)
  })

  it('список правил соединяется через «и», any — через «или»', () => {
    expect(evaluateCondition([{ path: 'type', eq: 'company' }, { path: 'age', gte: 18 }], ctx())).toBe(true)
    expect(evaluateCondition({ any: [{ path: 'type', eq: 'person' }, { path: 'age', gte: 18 }] }, ctx())).toBe(true)
    expect(evaluateCondition({ not: { path: 'type', eq: 'person' } }, ctx())).toBe(true)
  })

  /**
   * Относительный путь — единственный способ сослаться на соседнее поле строки:
   * абсолютный пришлось бы писать по индексу, а он меняется при каждом удалении.
   */
  it('относительный путь ищет соседа в той же строке', () => {
    expect(resolveConditionPath('../kind', 'items.1.price')).toBe('items.1.kind')
    expect(evaluateCondition({ path: '../kind', eq: 'disc' }, ctx('items.1.price'))).toBe(true)
    expect(evaluateCondition({ path: '../kind', eq: 'disc' }, ctx('items.0.price'))).toBe(false)
  })

  it('регулярка не ломается на повторном вызове', () => {
    const condition = { path: 'type', matches: '^comp', matchesFlags: 'g' }

    expect(evaluateCondition(condition, ctx())).toBe(true)
    expect(evaluateCondition(condition, ctx())).toBe(true)
  })

  it('зависимости называются, чтобы не пересчитывать всю форму', () => {
    expect(conditionDependencies({ all: [{ path: 'type', eq: 'x' }, { path: 'age', gt: 1 }] }))
      .toEqual(['type', 'age'])
  })

  it('функциональное условие честно не называет зависимостей', () => {
    expect(conditionDependencies(() => true)).toEqual([])
  })
})

describe('раскладка', () => {
  it('порядок применяется, а неперечисленные встают в звёздочку', () => {
    const items = [{ templatePath: 'a' }, { templatePath: 'b' }, { templatePath: 'c' }]

    expect(applyOrder(items, ['c', '*']).map(i => i.templatePath)).toEqual(['c', 'a', 'b'])
  })

  /** Без этого добавленное в схему поле молча исчезало бы из формы. */
  it('поле вне списка не теряется даже без звёздочки', () => {
    const items = [{ templatePath: 'a' }, { templatePath: 'b' }]

    expect(applyOrder(items, ['b']).map(i => i.templatePath)).toEqual(['b', 'a'])
  })

  it('подпись выводится из ключа, когда её нет в схеме', () => {
    expect(humanize('firstName')).toBe('First name')
    expect(humanize('first_name')).toBe('First name')
    expect(humanize('')).toBe('')
  })

  it('слияние uiSchema: правая сильнее по каждому листу', () => {
    const merged = mergeUiSchema(
      { fields: { a: { label: 'A', hint: 'из базы' } }, hidden: ['x'] },
      { fields: { a: { label: 'A+' } }, hidden: ['y'] },
    )

    expect(merged.fields?.a).toEqual({ label: 'A+', hint: 'из базы' })
    expect(merged.hidden).toEqual(['x', 'y'])
  })
})
