import { describe, expect, it } from 'vitest'

import { CIRCULAR_MARKER, UNSERIALIZABLE_MARKER, serializeCode, serializeStable } from './serializeCode'

describe('serializeCode', () => {
  it('строка проходит как есть, без кавычек', () => {
    expect(serializeCode('уже готовый текст')).toBe('уже готовый текст')
    // Строка, похожая на JSON, тоже не переформатируется: это не наше дело.
    expect(serializeCode('{"a":1}')).toBe('{"a":1}')
  })

  it('объект сериализуется с отступом', () => {
    expect(serializeCode({ a: 1, b: [2] })).toBe('{\n  "a": 1,\n  "b": [\n    2\n  ]\n}')
  })

  it('отступ настраивается', () => {
    expect(serializeCode({ a: 1 }, 4)).toBe('{\n    "a": 1\n}')
  })

  // Данные приходят из БД: цикл там встречается, а зависшая вкладка недопустима.
  it('циклическая ссылка даёт маркер и не роняет', () => {
    const node: Record<string, unknown> = { name: 'root' }
    node.self = node

    const result = serializeCode(node)

    expect(result).toContain(CIRCULAR_MARKER)
    expect(result).toContain('"name": "root"')
  })

  it('глубокий цикл через массив тоже переживается', () => {
    const parent: Record<string, unknown> = { id: 1 }
    parent.children = [{ parent }]

    expect(() => serializeCode(parent)).not.toThrow()
    expect(serializeCode(parent)).toContain(CIRCULAR_MARKER)
  })

  // Штатный `JSON.stringify` на BigInt бросает TypeError.
  it('BigInt не роняет сериализацию', () => {
    expect(serializeCode({ amount: 9007199254740993n })).toContain('9007199254740993n')
  })

  it('undefined даёт пустую строку — показывать нечего', () => {
    expect(serializeCode(undefined)).toBe('')
  })

  it('null остаётся литералом: «нет данных» решает потребитель', () => {
    expect(serializeCode(null)).toBe('null')
  })

  it('функция и символ дают пустую строку, а не слово undefined', () => {
    expect(serializeCode(() => {})).toBe('')
    expect(serializeCode(Symbol('x'))).toBe('')
  })

  it('числа и булевы печатаются литералами', () => {
    expect(serializeCode(42)).toBe('42')
    expect(serializeCode(false)).toBe('false')
  })

  // Последний рубеж: `toJSON`, который сам бросает.
  it('падение сериализации даёт маркер, а не исключение', () => {
    const hostile = {
      toJSON() {
        throw new Error('nope')
      },
    }

    expect(serializeCode(hostile)).toBe(UNSERIALIZABLE_MARKER)
  })

  // `JSON.stringify` зовёт `toJSON` раньше `replacer`, и один враждебный `toJSON`
  // обрывал весь вызов — вместе с данными, ради которых компонент открывают.
  it('маркер получает только упавшее значение: соседи, цикл и BigInt остаются', () => {
    const request: Record<string, unknown> = { url: '/ledger' }
    request.self = request
    const result = serializeCode({
      error: 'Timeout',
      release: '2026.10.6',
      ledgerEntryId: 9007199254740993n,
      request,
      customer: {
        toJSON() {
          throw new Error('PII redaction failed')
        },
      },
    })

    expect(result).toContain('"error": "Timeout"')
    expect(result).toContain('"release": "2026.10.6"')
    expect(result).toContain('"ledgerEntryId": "9007199254740993n"')
    expect(result).toContain(`"self": "${CIRCULAR_MARKER}"`)
    expect(result).toContain(`"customer": "${UNSERIALIZABLE_MARKER}"`)
  })

  it('геттер, который бросает, портит только своё поле', () => {
    const value = {
      id: 7,
      get secret(): string {
        throw new Error('locked')
      },
      tags: ['a'],
    }

    expect(JSON.parse(serializeCode(value))).toEqual({ id: 7, secret: UNSERIALIZABLE_MARKER, tags: ['a'] })
  })

  it('`toJSON`, который работает, по-прежнему применяется', () => {
    expect(serializeCode({ at: new Date(Date.UTC(2026, 9, 6)) })).toContain('"at": "2026-10-06T00:00:00.000Z"')
  })

  it('элемент массива с враждебным `toJSON` не роняет массив', () => {
    const hostile = {
      toJSON: () => {
        throw new Error('nope')
      },
    }

    expect(JSON.parse(serializeCode([1, hostile, 3]))).toEqual([1, UNSERIALIZABLE_MARKER, 3])
  })
})

describe('serializeStable', () => {
  it('сбой в одном поле не обнуляет сравнение', () => {
    const hostile = {
      toJSON: () => {
        throw new Error('nope')
      },
    }

    expect(JSON.parse(serializeStable({ b: 2, a: hostile }))).toEqual({ a: UNSERIALIZABLE_MARKER, b: 2 })
    expect(serializeStable({ b: 2, a: 1 })).toBe('{\n  "a": 1,\n  "b": 2\n}')
  })
})
