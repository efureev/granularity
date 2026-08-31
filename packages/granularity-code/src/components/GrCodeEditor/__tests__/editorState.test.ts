import { describe, expect, it } from 'vitest'

import { clampIssues, minimalChange, type GrCodeIssue } from '../editorState'

/** Применение замены к строке — то, что делает CodeMirror с транзакцией. */
function apply(source: string, change: ReturnType<typeof minimalChange>): string {
  if (!change)
    return source

  return source.slice(0, change.from) + change.insert + source.slice(change.to)
}

describe('minimalChange', () => {
  it('одинаковые строки менять не надо', () => {
    expect(minimalChange('abc', 'abc')).toBeNull()
  })

  it('вставка в середину трогает только середину', () => {
    expect(minimalChange('ac', 'abc')).toEqual({ from: 1, to: 1, insert: 'b' })
  })

  it('удаление из середины не трогает края', () => {
    expect(minimalChange('abc', 'ac')).toEqual({ from: 1, to: 2, insert: '' })
  })

  it('дописывание в конец не трогает начало', () => {
    expect(minimalChange('ab', 'abc')).toEqual({ from: 2, to: 2, insert: 'c' })
  })

  it('вставка в начало не трогает хвост', () => {
    expect(minimalChange('bc', 'abc')).toEqual({ from: 0, to: 0, insert: 'a' })
  })

  /**
   * Замена одной буквы среди тысячи символов обязана остаться заменой одной
   * буквы: иначе курсор и история сбрасываются на каждом нажатии клавиши.
   */
  it('правка одного символа в длинном тексте остаётся точечной', () => {
    const before = `${'x'.repeat(500)}a${'y'.repeat(500)}`
    const after = `${'x'.repeat(500)}b${'y'.repeat(500)}`
    const change = minimalChange(before, after)!

    expect(change.to - change.from).toBe(1)
    expect(change.insert).toBe('b')
  })

  it('пустой документ и полное стирание', () => {
    expect(minimalChange('', 'abc')).toEqual({ from: 0, to: 0, insert: 'abc' })
    expect(minimalChange('abc', '')).toEqual({ from: 0, to: 3, insert: '' })
  })

  /** Инвариант посильнее точечных проверок: замена обязана превращать одно в другое. */
  describe('применение замены даёт целевой текст', () => {
    const cases: Array<[string, string]> = [
      ['', ''],
      ['a', ''],
      ['', 'a'],
      ['abc', 'abc'],
      ['abc', 'axc'],
      ['aaa', 'aa'],
      ['aa', 'aaa'],
      ['const x = 1', 'const y = 2'],
      ['одна\nстрока', 'одна\nдругая\nстрока'],
      ['abab', 'abcab'],
    ]

    it.each(cases)('%j → %j', (before, after) => {
      expect(apply(before, minimalChange(before, after))).toBe(after)
    })
  })
})

describe('clampIssues', () => {
  const issue = (from: number, to: number): GrCodeIssue => ({
    from,
    to,
    severity: 'error',
    message: 'ошибка',
  })

  it('замечание внутри документа не трогается', () => {
    expect(clampIssues([issue(1, 3)], 10)).toEqual([issue(1, 3)])
  })

  /**
   * Ответ асинхронного `validate` приходит на текст, которого уже нет.
   * Замечание за границей уронило бы CodeMirror при построении декорации.
   */
  it('замечание за концом документа обрезается до границы', () => {
    expect(clampIssues([issue(5, 40)], 10)).toEqual([issue(5, 10)])
  })

  it('замечание целиком за концом отбрасывается', () => {
    expect(clampIssues([issue(50, 60)], 10)).toEqual([])
  })

  it('отрицательная позиция подтягивается к нулю', () => {
    expect(clampIssues([issue(-5, 2)], 10)).toEqual([issue(0, 2)])
  })

  it('перевёрнутый диапазон не даёт отрицательной длины', () => {
    const [clamped] = clampIssues([issue(7, 3)], 10)

    expect(clamped!.to).toBeGreaterThanOrEqual(clamped!.from)
  })
})
