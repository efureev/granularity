import { describe, expect, it } from 'vitest'

import { diffLines, type GrDiffLine } from '../diffLines'
import { collapseUnchanged, expandGap, toSplitRows, type GrDiffRow } from '../collapse'
import { diffWords, splitWords } from '../diffWords'

function linesOf(before: string, after: string) {
  return diffLines(before, after).lines
}

/** Компактная запись рядов: `=a` строка, `…N` пропуск на N строк. */
function shape(rows: GrDiffRow[]): string[] {
  return rows.map(row => row.kind === 'gap'
    ? `…${row.hidden}`
    : `${row.line.op === 'equal' ? '=' : row.line.op === 'add' ? '+' : '-'}${row.line.text}`)
}

describe('collapseUnchanged', () => {
  const long = (count: number) => Array.from({ length: count }, (_, i) => `l${i}`).join('\n')

  it('короткий участок не сворачивается — прятать нечего', () => {
    const rows = collapseUnchanged(linesOf('a\nb', 'a\nb'), { context: 3 })

    expect(shape(rows)).toEqual(['=a', '=b'])
  })

  it('длинный неизменный участок сворачивается в пропуск', () => {
    const before = long(20)
    const after = before.replace('l10', 'l10 changed')
    const rows = collapseUnchanged(diffLines(before, after).lines, { context: 2 })

    expect(shape(rows)).toEqual([
      '…8',
      '=l8',
      '=l9',
      '-l10',
      '+l10 changed',
      '=l11',
      '=l12',
      '…7',
    ])
  })

  /** Пропуск раскрывается по своему id и не трогает соседние. */
  it('раскрытый пропуск показывает строки, остальные остаются свёрнутыми', () => {
    const before = long(20)
    const after = before.replace('l10', 'l10 changed')
    const all = diffLines(before, after).lines
    const collapsed = collapseUnchanged(all, { context: 2 })
    const firstGap = collapsed.find(row => row.kind === 'gap')

    expect(firstGap).toBeDefined()

    const expandedRows = collapseUnchanged(all, {
      context: 2,
      expanded: new Map([[firstGap!.id, { top: 99, bottom: 0 }]]),
    })
    const gaps = expandedRows.filter(row => row.kind === 'gap')

    expect(gaps).toHaveLength(1)
    expect(shape(expandedRows).slice(0, 3)).toEqual(['=l0', '=l1', '=l2'])
  })

  it('`context: Infinity` не сворачивает ничего', () => {
    const before = long(20)
    const rows = collapseUnchanged(diffLines(before, before).lines, { context: Number.POSITIVE_INFINITY })

    expect(rows.every(row => row.kind === 'line')).toBe(true)
    expect(rows).toHaveLength(20)
  })

  it('`context: 0` оставляет только изменения', () => {
    const rows = collapseUnchanged(linesOf('a\nb\nc', 'a\nx\nc'), { context: 0 })

    expect(shape(rows)).toEqual(['…1', '-b', '+x', '…1'])
  })

  /** Хвост в начале файла контекстом не считается — до него нет изменений. */
  it('изменение в первой строке не требует контекста сверху', () => {
    const before = long(10)
    const after = before.replace('l0', 'l0 changed')
    const rows = collapseUnchanged(diffLines(before, after).lines, { context: 2 })

    expect(shape(rows).slice(0, 2)).toEqual(['-l0', '+l0 changed'])
  })
})

describe('toSplitRows', () => {
  it('замена строки становится одной парой, а не двумя рядами', () => {
    const rows = collapseUnchanged(linesOf('a\nb\nc', 'a\nx\nc'), { context: 5 })
    const pairs = toSplitRows(rows)

    expect(pairs).toHaveLength(3)

    const pair = pairs[1]

    expect(pair?.kind).toBe('pair')
    expect(pair?.kind === 'pair' && pair.left?.op).toBe('remove')
    expect(pair?.kind === 'pair' && pair.left?.text).toBe('b')
    expect(pair?.kind === 'pair' && pair.right?.op).toBe('add')
    expect(pair?.kind === 'pair' && pair.right?.text).toBe('x')
  })

  it('одинокое удаление оставляет правую сторону пустой', () => {
    const pairs = toSplitRows(collapseUnchanged(linesOf('a\nb', 'a'), { context: 5 }))

    const last = pairs.at(-1)

    expect(last?.kind === 'pair' && last.left?.op).toBe('remove')
    expect(last?.kind === 'pair' && last.right).toBeNull()
  })

  it('одинокое добавление оставляет левую сторону пустой', () => {
    const pairs = toSplitRows(collapseUnchanged(linesOf('a', 'a\nb'), { context: 5 }))

    const last = pairs.at(-1)

    expect(last?.kind === 'pair' && last.left).toBeNull()
    expect(last?.kind === 'pair' && last.right?.op).toBe('add')
  })

  /**
   * `diffLines` выдаёт блок правки целиком удалениями, а потом целиком
   * добавлениями. Пара «удаление и следующий ряд» сводила бы вместе последнее
   * удаление и первое добавление — строки, друг к другу не относящиеся.
   */
  it('блок из нескольких строк сшивается построчно, а не лесенкой', () => {
    const before = 'head\nsigned: false\nstatus: draft\ntitle: Договор\ntail'
    const after = 'head\nsigned: true\nstatus: signed\ntitle: Договор № 41\ntail'

    const pairs = toSplitRows(collapseUnchanged(linesOf(before, after), { context: 5 }))
      .filter(entry => entry.kind === 'pair')
      .map(entry => [entry.left?.text ?? null, entry.right?.text ?? null])

    expect(pairs).toEqual([
      ['head', 'head'],
      ['signed: false', 'signed: true'],
      ['status: draft', 'status: signed'],
      ['title: Договор', 'title: Договор № 41'],
      ['tail', 'tail'],
    ])
  })

  it('блок с разным числом строк добивается пустой стороной', () => {
    const pairs = toSplitRows(collapseUnchanged(linesOf('a\nb\nc', 'x'), { context: 5 }))
      .filter(entry => entry.kind === 'pair')
      .map(entry => [entry.left?.text ?? null, entry.right?.text ?? null])

    expect(pairs).toEqual([['a', 'x'], ['b', null], ['c', null]])
  })

  it('пропуск между правками обрывает блок, а не сшивает соседей', () => {
    const before = ['a', ...Array.from({ length: 20 }, (_, i) => `l${i}`), 'b'].join('\n')
    const after = ['x', ...Array.from({ length: 20 }, (_, i) => `l${i}`), 'y'].join('\n')

    const kinds = toSplitRows(collapseUnchanged(linesOf(before, after), { context: 1 }))
      .map(entry => entry.kind === 'gap' ? 'gap' : `${entry.left?.text ?? '_'}|${entry.right?.text ?? '_'}`)

    expect(kinds).toContain('gap')
    expect(kinds).toContain('a|x')
    expect(kinds).toContain('b|y')
  })

  it('пропуск переносится в обе колонки одной записью', () => {
    const before = Array.from({ length: 20 }, (_, i) => `l${i}`).join('\n')
    const after = before.replace('l10', 'x')
    const pairs = toSplitRows(collapseUnchanged(diffLines(before, after).lines, { context: 2 }))

    expect(pairs.filter(entry => entry.kind === 'gap')).toHaveLength(2)
  })
})

describe('раскрытие пропуска шагами', () => {
  const long = (count: number) => Array.from({ length: count }, (_, i) => `l${i}`).join('\n')

  /** Шестьдесят одинаковых строк, правка в середине: два пропуска по краям. */
  function twoGaps() {
    const before = long(60)
    const after = before.replace('l30', 'l30 changed')

    return diffLines(before, after).lines
  }

  function gapsOf(lines: readonly GrDiffLine[], expanded?: Map<string, { top: number, bottom: number }>) {
    return collapseUnchanged(lines, { context: 2, expanded })
      .filter(row => row.kind === 'gap')
  }

  it('шаг открывает ровно столько строк, сколько просили', () => {
    const lines = twoGaps()
    const [first] = gapsOf(lines)

    expect(first!.hidden).toBe(28)

    const opened = gapsOf(lines, new Map([[first!.id, expandGap(undefined, 'top', first!.hidden, 10)]]))

    expect(opened[0]!.hidden).toBe(18)
  })

  it('второе нажатие открывает ещё столько же, а не заново', () => {
    const lines = twoGaps()
    const [first] = gapsOf(lines)

    let state = expandGap(undefined, 'top', first!.hidden, 10)
    state = expandGap(state, 'top', gapsOf(lines, new Map([[first!.id, state]]))[0]!.hidden, 10)

    expect(gapsOf(lines, new Map([[first!.id, state]]))[0]!.hidden).toBe(8)
  })

  it('края открываются независимо: сверху и снизу — свой счёт', () => {
    const lines = twoGaps()
    const [first] = gapsOf(lines)

    const state = expandGap(expandGap(undefined, 'top', 28, 10), 'bottom', 18, 10)

    expect(state).toEqual({ top: 10, bottom: 10 })

    const rows = collapseUnchanged(lines, { context: 2, expanded: new Map([[first!.id, state]]) })
    const shown = shape(rows)

    // Сверху открылись строки после первой контекстной пары…
    expect(shown.slice(0, 4)).toEqual(['=l0', '=l1', '=l2', '=l3'])
    // …а снизу — примыкающие к правке.
    expect(shown).toContain('=l27')
  })

  it('остаток меньше шага дораскрывается целиком, и пропуск исчезает', () => {
    const lines = twoGaps()
    const [first] = gapsOf(lines)

    let state = expandGap(undefined, 'top', 28, 10)
    state = expandGap(state, 'top', 18, 10)
    // Осталось 8 — меньше шага: следующее нажатие открывает всё.
    state = expandGap(state, 'top', 8, 10)

    expect(gapsOf(lines, new Map([[first!.id, state]]))).toHaveLength(1)
    expect(gapsOf(lines, new Map([[first!.id, state]]))[0]!.id).not.toBe(first!.id)
  })

  /**
   * Идентификатор считается по первой строке участка, а не по первой скрытой.
   * Считай его по скрытым — он менялся бы на каждом шаге, и состояние теряло бы
   * свой же пропуск: второе нажатие открывало бы пропуск заново с нуля.
   */
  it('идентификатор пропуска не меняется от раскрытия', () => {
    const lines = twoGaps()
    const [first] = gapsOf(lines)
    const opened = gapsOf(lines, new Map([[first!.id, { top: 10, bottom: 0 }]]))

    expect(opened[0]!.id).toBe(first!.id)
  })

  it('раскрытие одного пропуска не трогает соседний', () => {
    const lines = twoGaps()
    const [first, second] = gapsOf(lines)
    const opened = gapsOf(lines, new Map([[first!.id, { top: 10, bottom: 0 }]]))

    expect(opened[1]!.id).toBe(second!.id)
    expect(opened[1]!.hidden).toBe(second!.hidden)
  })

  it('раскрывать нечего — состояние не растёт', () => {
    expect(expandGap({ top: 5, bottom: 0 }, 'top', 0, 10)).toEqual({ top: 5, bottom: 0 })
  })
})

describe('splitWords', () => {
  it('слова, пробелы и знаки — отдельными токенами', () => {
    expect(splitWords('foo(bar)')).toEqual(['foo', '(', 'bar', ')'])
  })

  it('кириллица — слово, а не набор знаков', () => {
    expect(splitWords('привет мир')).toEqual(['привет', ' ', 'мир'])
  })

  it('склейка токенов равна исходной строке', () => {
    const line = '  const x = { a: 1 } // привет'

    expect(splitWords(line).join('')).toBe(line)
  })
})

describe('diffWords', () => {
  it('изменённое слово отмечено, остальное — фон', () => {
    const { before, after } = diffWords('const a = 1', 'const b = 1')

    expect(before).toEqual([
      { text: 'const ', changed: false },
      { text: 'a', changed: true },
      { text: ' = 1', changed: false },
    ])
    expect(after[1]).toEqual({ text: 'b', changed: true })
  })

  it('соседние куски одного вида склеиваются', () => {
    const { before } = diffWords('aaa bbb ccc', 'aaa xxx ccc')

    expect(before.filter(word => word.changed)).toHaveLength(1)
  })

  it('склейка сторон равна исходным строкам', () => {
    const left = 'const value = compute(a, b)'
    const right = 'const result = compute(a, c)'
    const { before, after } = diffWords(left, right)

    expect(before.map(w => w.text).join('')).toBe(left)
    expect(after.map(w => w.text).join('')).toBe(right)
  })

  /**
   * Строка без пробелов вырождает пословный разбор в посимвольный: подсвечен
   * каждый второй символ, читать нечего, а стоит дорого.
   */
  it('слишком длинная строка помечается изменённой целиком', () => {
    const left = 'a'.repeat(500)
    const right = `${'a'.repeat(499)}b`
    const { before, after } = diffWords(left, right, { maxLength: 400 })

    expect(before).toEqual([{ text: left, changed: true }])
    expect(after).toEqual([{ text: right, changed: true }])
  })

  it('пустая сторона не даёт пустых кусков', () => {
    expect(diffWords('', 'abc').before).toEqual([])
  })
})
