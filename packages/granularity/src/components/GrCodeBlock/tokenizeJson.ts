/**
 * Токенизация JSON для подсветки.
 *
 * Своя, а не библиотечная: тянуть highlight.js ради четырёх ролей несоразмерно
 * — компонент показывает JSON и обычный текст, а не произвольные языки.
 *
 * Разбор посимвольный и **ничего не теряет**: пробелы, переносы и запятые тоже
 * становятся токенами. Отсюда инвариант, который держит тест: склейка `text`
 * всех токенов равна исходной строке. Любая потеря символа — сдвиг разметки.
 */

export type GrCodeTokenKind =
  /** Имя поля объекта: строка, за которой идёт двоеточие. */
  | 'key'
  | 'string'
  | 'number'
  /** `true`, `false`, `null`. */
  | 'literal'
  /** Скобки, запятые, двоеточия. */
  | 'punctuation'
  /** Пробелы, переносы и всё, что не опознано. */
  | 'plain'

export interface GrCodeToken {
  text: string
  kind: GrCodeTokenKind
}

const PUNCTUATION = new Set(['{', '}', '[', ']', ',', ':'])
const LITERALS = ['true', 'false', 'null'] as const

/** Строка от открывающей кавычки до закрывающей, с учётом экранирования. */
function readString(source: string, start: number): number {
  let index = start + 1

  while (index < source.length) {
    const char = source[index]

    // Экранированная кавычка не закрывает строку: `"a\":b"` — одно значение,
    // а не строка плюс мусор.
    if (char === '\\') {
      index += 2
      continue
    }

    index += 1
    if (char === '"') break
  }

  return index
}

/** Число целиком: знак, дробная часть, экспонента. */
function readNumber(source: string, start: number): number {
  let index = start

  if (source[index] === '-') index += 1
  while (index < source.length && /[\d.eE+-]/.test(source[index])) index += 1

  return index
}

/** Первый непробельный символ после позиции — по нему строка отличается от ключа. */
function nextMeaningful(source: string, from: number): string | undefined {
  for (let index = from; index < source.length; index += 1) {
    if (!/\s/.test(source[index])) return source[index]
  }

  return undefined
}

export function tokenizeJson(source: string): GrCodeToken[] {
  const tokens: GrCodeToken[] = []
  let index = 0
  let plainStart = 0

  const flushPlain = (until: number): void => {
    if (until > plainStart) tokens.push({ text: source.slice(plainStart, until), kind: 'plain' })
  }

  while (index < source.length) {
    const char = source[index]

    if (char === '"') {
      flushPlain(index)
      const end = readString(source, index)
      // Ключ от строки отличает только идущее следом двоеточие.
      const kind: GrCodeTokenKind = nextMeaningful(source, end) === ':' ? 'key' : 'string'
      tokens.push({ text: source.slice(index, end), kind })
      index = end
      plainStart = index
      continue
    }

    if (PUNCTUATION.has(char)) {
      flushPlain(index)
      tokens.push({ text: char, kind: 'punctuation' })
      index += 1
      plainStart = index
      continue
    }

    if (char === '-' || (char >= '0' && char <= '9')) {
      flushPlain(index)
      const end = readNumber(source, index)
      tokens.push({ text: source.slice(index, end), kind: 'number' })
      index = end
      plainStart = index
      continue
    }

    const literal = LITERALS.find(candidate => source.startsWith(candidate, index))
    if (literal) {
      flushPlain(index)
      tokens.push({ text: literal, kind: 'literal' })
      index += literal.length
      plainStart = index
      continue
    }

    index += 1
  }

  flushPlain(source.length)

  return tokens
}
