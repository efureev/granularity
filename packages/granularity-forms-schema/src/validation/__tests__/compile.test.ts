import { runFieldRules } from '@feugene/granularity'
import { describe, expect, it } from 'vitest'

import type { GrSchemaFieldInstance, GrSchemaNode } from '../../model'
import { array, object, root, scalar } from '../../model/__tests__/nodes'
import { expandLeafFields } from '../../model'
import { compileFieldRules, compileRules } from '../compile'
import { explainRules } from '../explain'

/**
 * Компилятор — место, где чужая схема превращается в правила ядра. Проверяем
 * не форму правила, а **вердикт**: правило, выглядящее верным, но не ловящее
 * ошибку, хуже отсутствующего — оно создаёт видимость проверки.
 */
function instance(node: GrSchemaNode, name = node.key): GrSchemaFieldInstance {
  return { node, name, templatePath: name, indices: [], parent: '', depth: 0, leaf: true }
}

/**
 * Прогоняет скомпилированные правила через сам движок ядра.
 *
 * Именно через него, а не своей проверкой полей правила: смысл компилятора в
 * том, какой вердикт вынесет форма, а не в том, как выглядит объект правила.
 */
async function verdict(node: GrSchemaNode, value: unknown, options = {}): Promise<string | undefined> {
  const rules = compileFieldRules(instance(node), options)
  return runFieldRules(value, rules, {}, (failure, rule) => rule.message ?? failure)
}

describe('обязательность', () => {
  it('пустая строка не проходит required', async () => {
    expect(await verdict(scalar('a', 'string', { required: true }), '')).toBeTruthy()
    expect(await verdict(scalar('a', 'string', { required: true }), 'x')).toBeUndefined()
  })

  /**
   * Ядро не считает `false` пустым, поэтому «согласен с условиями» через
   * `required` пропустил бы снятый флажок. Единственный верный перевод —
   * проверка значения, и это ровно тот случай, ради которого заведён средний ярус.
   */
  it('«обязан быть отмечен» — не required, а проверка значения', async () => {
    const node = scalar('agree', 'boolean', { const: true })

    expect(await verdict(node, false)).toBeTruthy()
    expect(await verdict(node, true)).toBeUndefined()
  })
})

describe('строки', () => {
  it('длина ложится в родные правила ядра', async () => {
    const node = scalar('a', 'string', { constraints: { min: 3, max: 5 } })

    expect(await verdict(node, 'ab')).toBeTruthy()
    expect(await verdict(node, 'abcdef')).toBeTruthy()
    expect(await verdict(node, 'abcd')).toBeUndefined()
  })

  it('email и url уходят в `type`, а не в регулярку', () => {
    const rules = compileFieldRules(instance(scalar('a', 'string', { format: 'email' })))

    expect(rules.some(rule => rule.type === 'email')).toBe(true)
    expect(rules.some(rule => rule.pattern)).toBe(false)
  })

  /** `type` ядра знает только email и url — остальное выражается регуляркой. */
  it('прочие форматы становятся регуляркой со своим сообщением', async () => {
    const node = scalar('a', 'string', { format: 'uuid' })

    expect(await verdict(node, 'не-uuid')).toBe('Enter a valid UUID')
    expect(await verdict(node, '123e4567-e89b-12d3-a456-426614174000')).toBeUndefined()
  })

  it('календарно несуществующая дата не проходит, хотя формат верен', async () => {
    const node = scalar('a', 'string', { format: 'date' })

    expect(await verdict(node, '2026-02-31')).toBeTruthy()
    expect(await verdict(node, '2026-02-28')).toBeUndefined()
  })

  it('своя регулярка схемы переживает повторный прогон', async () => {
    // Флаг `g` двигает `lastIndex`: без его снятия второй вызов вернул бы ложь.
    const node = scalar('a', 'string', { constraints: { pattern: '^ab$', patternFlags: 'g' } })

    expect(await verdict(node, 'ab')).toBeUndefined()
    expect(await verdict(node, 'ab')).toBeUndefined()
  })
})

describe('числа', () => {
  it('границы числовой модели ложатся в родные правила', async () => {
    const node = scalar('a', 'number', { constraints: { min: 18, max: 60 } })

    expect(await verdict(node, 17)).toBeTruthy()
    expect(await verdict(node, 25)).toBeUndefined()
  })

  /**
   * Самая дорогая ловушка ядра: `measure()` меряет строку **длиной**, поэтому
   * `min: 18` на значении `"25"` дало бы «минимум 18» — символов-то два.
   */
  it('при строковой модели границы считаются числом, а не длиной строки', async () => {
    const node = scalar('a', 'number', { constraints: { min: 18 } })
    const options = { numericModelAt: () => false }

    expect(await verdict(node, '25', options)).toBeUndefined()
    expect(await verdict(node, '7', options)).toBeTruthy()
  })

  it('целое и кратность проверяются средним ярусом', async () => {
    expect(await verdict(scalar('a', 'number', { constraints: { integer: true } }), 1.5)).toBeTruthy()
    expect(await verdict(scalar('a', 'number', { constraints: { step: 0.1 } }), 0.30)).toBeUndefined()
    expect(await verdict(scalar('a', 'number', { constraints: { step: 5 } }), 7)).toBeTruthy()
  })

  it('строгие границы отличаются от нестрогих', async () => {
    const node = scalar('a', 'number', { constraints: { exclusiveMin: 0 } })

    expect(await verdict(node, 0)).toBeTruthy()
    expect(await verdict(node, 0.1)).toBeUndefined()
  })

  it('ноль не считается пустым и проверяется наравне с прочими', async () => {
    const node = scalar('a', 'number', { constraints: { exclusiveMin: 0 } })

    expect(await verdict(node, 0)).toBeTruthy()
  })
})

describe('массивы и даты', () => {
  it('уникальность элементов проверяется по значению', async () => {
    const node = array('a', scalar('*'), { constraints: { uniqueItems: true } })

    expect(await verdict(node, ['x', 'x'])).toBeTruthy()
    expect(await verdict(node, ['x', 'y'])).toBeUndefined()
  })

  it('границы дат понимают и строку, и Date', async () => {
    const node = scalar('a', 'date', { constraints: { minDate: '2026-01-01' } })

    expect(await verdict(node, '2025-12-31')).toBeTruthy()
    expect(await verdict(node, new Date('2026-06-01'))).toBeUndefined()
  })
})

describe('порядок сообщений', () => {
  /** Ядро возвращает первое сработавшее правило: порядок задаёт, что услышит пользователь. */
  it('сначала обязательность, потом формат', async () => {
    const node = scalar('a', 'string', { required: true, format: 'email' })

    const empty = await verdict(node, '')
    const wrong = await verdict(node, 'не почта')

    expect(empty).not.toBe(wrong)
    expect(wrong).toBeTruthy()
  })
})

describe('привязка к форме', () => {
  /**
   * `hasField` формы реализован как «у поля есть правила»: поле без единого
   * правила к форме не привязано и её ошибку не покажет.
   */
  it('поле без проверок получает пустое правило, а не пустой список', () => {
    const rules = compileFieldRules(instance(scalar('a')))

    expect(rules).toHaveLength(1)
    expect(rules[0]).toEqual({})
  })

  it('ключ правила — инстанс-путь, тот же, что у поля формы', () => {
    const schema = root([array('items', object('*', [scalar('name', 'string', { required: true })]))])
    const rules = compileRules(expandLeafFields(schema, { items: [{}, {}] }))

    expect(Object.keys(rules)).toEqual(['items.0.name', 'items.1.name'])
  })

  it('контейнеры правил не получают, а массив с границами — получает', () => {
    const schema = root([
      object('user', [scalar('city')]),
      array('items', object('*', [scalar('name')]), { constraints: { min: 1 } }),
    ])
    const rules = compileRules([
      ...expandLeafFields(schema, { items: [] }),
      { node: schema.fields[1]!, name: 'items', templatePath: 'items', indices: [], parent: '', depth: 0, leaf: false },
    ])

    expect(Object.keys(rules)).toContain('items')
    expect(Object.keys(rules)).not.toContain('user')
  })
})

describe('explainRules', () => {
  it('называет ярус и предмет каждой проверки', () => {
    const node = scalar('a', 'number', { required: true, constraints: { min: 1, integer: true } })

    expect(explainRules(instance(node))).toEqual([
      { tier: 'declarative', check: 'required', message: undefined },
      { tier: 'declarative', check: 'min', message: undefined },
      { tier: 'local', check: 'validator', message: 'Enter a whole number' },
    ])
  })

  it('поле без проверок отвечает честно', () => {
    expect(explainRules(instance(scalar('a')))).toEqual([{ tier: 'declarative', check: 'none' }])
  })
})
