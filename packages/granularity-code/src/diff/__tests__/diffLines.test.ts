import { describe, expect, it } from 'vitest'

import { diffLines, myersSteps, type GrDiffLine } from '../diffLines'

/** Компактная запись результата: `=a` равна, `-a` удалена, `+a` добавлена. */
function shape(lines: GrDiffLine[]): string[] {
  return lines.map(line => `${line.op === 'equal' ? '=' : line.op === 'add' ? '+' : '-'}${line.text}`)
}

describe('myersSteps', () => {
  it('одинаковые входы дают только равенства', () => {
    expect(myersSteps(['a', 'b'], ['a', 'b'], 10)).toEqual([
      { op: 'equal', aIndex: 0, bIndex: 0 },
      { op: 'equal', aIndex: 1, bIndex: 1 },
    ])
  })

  it('пустой вход слева — только добавления', () => {
    expect(myersSteps([], ['a'], 10)).toEqual([{ op: 'add', aIndex: null, bIndex: 0 }])
  })

  it('оба входа пусты — шагов нет', () => {
    expect(myersSteps([], [], 10)).toEqual([])
  })

  /** Дистанция больше бюджета — честный отказ, а не приблизительный ответ. */
  it('за бюджетом возвращает `null`, а не молча ошибается', () => {
    expect(myersSteps(['a', 'b', 'c'], ['x', 'y', 'z'], 2)).toBeNull()
    expect(myersSteps(['a', 'b', 'c'], ['x', 'y', 'z'], 6)).not.toBeNull()
  })
})

describe('diffLines', () => {
  it('совпадающие тексты — ни добавлений, ни удалений', () => {
    const result = diffLines('a\nb', 'a\nb')

    expect(result.added).toBe(0)
    expect(result.removed).toBe(0)
    expect(result.degraded).toBe(false)
    expect(shape(result.lines)).toEqual(['=a', '=b'])
  })

  it('вставка в середину', () => {
    expect(shape(diffLines('a\nc', 'a\nb\nc').lines)).toEqual(['=a', '+b', '=c'])
  })

  it('вставка в начало', () => {
    expect(shape(diffLines('b', 'a\nb').lines)).toEqual(['+a', '=b'])
  })

  it('вставка в конец', () => {
    expect(shape(diffLines('a', 'a\nb').lines)).toEqual(['=a', '+b'])
  })

  it('удаление целиком', () => {
    const result = diffLines('a\nb', '')

    expect(result.removed).toBe(2)
    expect(result.added).toBe(1)
    // Пустой текст — это одна пустая строка, а не ноль строк.
    expect(shape(result.lines)).toEqual(['-a', '-b', '+'])
  })

  it('замена строки — удаление и добавление', () => {
    expect(shape(diffLines('a\nb\nc', 'a\nx\nc').lines)).toEqual(['=a', '-b', '+x', '=c'])
  })

  /**
   * Нумерация — то, по чему читают дифф. Удалённая строка не имеет номера
   * справа, добавленная — слева; равные идут по обеим сторонам.
   */
  it('номера строк идут по своей стороне и не сбиваются', () => {
    const { lines } = diffLines('a\nb\nc', 'a\nx\nc')

    expect(lines.map(l => [l.beforeNumber, l.afterNumber])).toEqual([
      [1, 1],
      [2, null],
      [null, 2],
      [3, 3],
    ])
  })

  it('счётчики совпадают с числом строк соответствующего вида', () => {
    const result = diffLines('a\nb\nc', 'a\nx\ny\nc')

    expect(result.removed).toBe(result.lines.filter(l => l.op === 'remove').length)
    expect(result.added).toBe(result.lines.filter(l => l.op === 'add').length)
  })

  /** Срезка префикса и суффикса — то, ради чего дифф конфига вообще открывается. */
  it('правка одной строки среди тысячи не считается тысячей операций', () => {
    const before = Array.from({ length: 1000 }, (_, i) => `line ${i}`).join('\n')
    const after = before.replace('line 500', 'line 500 changed')
    const result = diffLines(before, after, { budget: 4 })

    expect(result.degraded).toBe(false)
    expect(result.added).toBe(1)
    expect(result.removed).toBe(1)
    expect(result.lines).toHaveLength(1001)
  })

  describe('бюджет', () => {
    it('исчерпание помечается и даёт верный, но огрублённый дифф', () => {
      const result = diffLines('a\nb\nc', 'x\ny\nz', { budget: 2 })

      expect(result.degraded).toBe(true)
      expect(shape(result.lines)).toEqual(['-a', '-b', '-c', '+x', '+y', '+z'])
    })

    /** Огрублённый проход обязан оставаться верным диффом: применив его, получим `after`. */
    it('огрублённый результат восстанавливает обе стороны', () => {
      const before = 'a\nb\nc'
      const after = 'x\ny\nz'
      const { lines } = diffLines(before, after, { budget: 2 })

      const left = lines.filter(l => l.op !== 'add').map(l => l.text).join('\n')
      const right = lines.filter(l => l.op !== 'remove').map(l => l.text).join('\n')

      expect(left).toBe(before)
      expect(right).toBe(after)
    })

    it('общий префикс переживает исчерпание бюджета', () => {
      const result = diffLines('same\na\nb', 'same\nx\ny', { budget: 1 })

      expect(result.degraded).toBe(true)
      expect(shape(result.lines)[0]).toBe('=same')
    })
  })

  /** Инвариант посильнее точечных проверок: дифф обязан восстанавливать оба входа. */
  describe('восстановление сторон', () => {
    const cases: Array<[string, string]> = [
      ['', ''],
      ['a', ''],
      ['', 'a'],
      ['a\nb\nc', 'a\nb\nc'],
      ['a\nb\nc', 'c\nb\na'],
      ['one\ntwo\nthree', 'one\nthree'],
      ['x', 'y'],
      ['a\n\nb', 'a\nb'],
    ]

    it.each(cases)('%j → %j', (before, after) => {
      const { lines } = diffLines(before, after)

      expect(lines.filter(l => l.op !== 'add').map(l => l.text).join('\n')).toBe(before)
      expect(lines.filter(l => l.op !== 'remove').map(l => l.text).join('\n')).toBe(after)
    })
  })
})
