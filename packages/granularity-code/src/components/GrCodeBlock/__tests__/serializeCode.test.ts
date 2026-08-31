import { describe, expect, it } from 'vitest'

import { CIRCULAR_MARKER, UNSERIALIZABLE_MARKER, serializeCode } from '../serializeCode'

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
})
