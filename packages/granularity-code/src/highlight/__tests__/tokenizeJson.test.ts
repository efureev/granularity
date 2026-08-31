import { describe, expect, it } from 'vitest'

import { tokenizeJson, type GrCodeRole } from '../tokenizeJson'

/** Роль по тексту токена — так тесты читаются, а не считают индексы. */
function kindOf(source: string, text: string): GrCodeRole | undefined {
  return tokenizeJson(source).find(token => token.text === text)?.role
}

describe('tokenizeJson', () => {
  // Главный инвариант: разбор ничего не теряет. Потерянный символ — сдвиг всей
  // разметки ниже по блоку, и заметить его глазами на 200 строках невозможно.
  it.each([
    '{"a": 1}',
    '{\n  "name": "Alice",\n  "tags": [1, 2.5, -3e10],\n  "ok": true,\n  "at": null\n}',
    '[]',
    '',
    'просто текст без json',
    '{"broken": ',
  ])('склейка токенов равна исходнику: %j', (source) => {
    expect(tokenizeJson(source).map(token => token.text).join('')).toBe(source)
  })

  it('ключ, строка, число и литералы получают разные роли', () => {
    const source = '{"name": "Alice", "age": 30, "ok": true, "at": null}'

    expect(kindOf(source, '"name"')).toBe('key')
    expect(kindOf(source, '"Alice"')).toBe('string')
    expect(kindOf(source, '30')).toBe('number')
    expect(kindOf(source, 'true')).toBe('literal')
    expect(kindOf(source, 'null')).toBe('literal')
  })

  it('скобки, запятые и двоеточия — пунктуация', () => {
    const kinds = tokenizeJson('{"a":[1]}')
      .filter(token => ['{', '}', '[', ']', ':'].includes(token.text))
      .map(token => token.role)

    expect(new Set(kinds)).toEqual(new Set(['punctuation']))
  })

  // `"a\":b"` — одно значение. Без учёта экранирования разбор принял бы его за
  // строку плюс мусор и покрасил бы остаток блока не тем.
  it('экранированная кавычка не закрывает строку', () => {
    const source = '{"q": "a\\": b"}'

    expect(kindOf(source, '"a\\": b"')).toBe('string')
    expect(tokenizeJson(source).map(token => token.text).join('')).toBe(source)
  })

  it('двоеточие внутри строки не делает её ключом', () => {
    expect(kindOf('{"url": "https://example.com"}', '"https://example.com"')).toBe('string')
  })

  it('ключ узнаётся через перенос строки перед двоеточием', () => {
    expect(kindOf('{"a"\n: 1}', '"a"')).toBe('key')
  })

  it('числа с дробной частью, знаком и экспонентой берутся целиком', () => {
    expect(kindOf('[-3.5e10]', '-3.5e10')).toBe('number')
  })

  it('пробелы и переносы остаются plain', () => {
    const tokens = tokenizeJson('{\n  "a": 1\n}')

    expect(tokens.some(token => token.role === 'plain' && token.text.includes('\n'))).toBe(true)
  })

  it('пустой вход даёт пустой список', () => {
    expect(tokenizeJson('')).toEqual([])
  })

  // Слово `nullable` начинается с `null`, но литералом не является.
  it('литерал не выкусывается из середины слова', () => {
    const source = '{"nullable": 1}'

    expect(kindOf(source, '"nullable"')).toBe('key')
    expect(tokenizeJson(source).some(token => token.role === 'literal')).toBe(false)
  })
})
