import { describe, expect, it, vi } from 'vitest'

import { createMarkdownDocument, parseMarkdown } from '../document'
import { markedEngine } from '../engine/marked'
import type { GrMdBlockNode, GrMdListItem } from '../types'

const keys = (source: string) => parseMarkdown(source).map(block => block.key)

/** Все пункты-задачи дерева в порядке документа. */
function taskItems(nodes: GrMdBlockNode[], out: GrMdListItem[] = []): GrMdListItem[] {
  for (const node of nodes) {
    if (node.type === 'list') {
      for (const item of node.items) {
        if (item.checked !== null)
          out.push(item)
        taskItems(item.children, out)
      }
    }
    else if (node.type === 'blockquote' || node.type === 'alert') {
      taskItems(node.children, out)
    }
  }
  return out
}

/** Первый текст пункта — им проверяется, что офсет указывает на *его* маркер. */
function leadText(item: GrMdListItem): string {
  const [first] = item.children
  if (!first || (first.type !== 'inline' && first.type !== 'paragraph'))
    return ''
  const text = first.children.find(child => child.type === 'text')
  return text?.type === 'text' ? text.value : ''
}

/** Где маркеры стоят на самом деле — эталон, посчитанный по исходнику. */
function markerPositions(source: string): number[] {
  const out: number[] = []
  const re = /\[[ x]\]/gi
  for (let m = re.exec(source); m; m = re.exec(source))
    out.push(m.index)
  return out
}

describe('инкрементальный документ', () => {
  it('правка одного абзаца меняет ключ только его блока', () => {
    const before = keys('Первый.\n\nВторой.\n\nТретий.\n')
    const after = keys('Первый.\n\nВторой изменён.\n\nТретий.\n')

    expect(after[0]).toBe(before[0])
    expect(after[1]).not.toBe(before[1])
    expect(after[2]).toBe(before[2])
  })

  it('вставка блока в начало не инвалидирует хвост — ключ от текста, а не от индекса', () => {
    const before = keys('Первый.\n\nВторой.\n')
    const after = keys('Новый.\n\nПервый.\n\nВторой.\n')

    expect(after.slice(1)).toEqual(before)
  })

  it('повторный разбор того же документа даёт те же ключи', () => {
    const source = '# Раздел\n\nТекст.\n\n- пункт\n'
    expect(keys(source)).toEqual(keys(source))
  })

  it('одинаковые по тексту блоки получают одинаковый ключ — это и есть переиспользование', () => {
    // Хвостовой перевод строки входит в `raw`, поэтому последний абзац
    // документа отличается от такого же в середине. Сравниваем средние.
    const [a, b] = keys('Повтор.\n\nПовтор.\n\nХвост.\n')
    expect(a).toBe(b)
  })

  it('не разбирает заново, когда источник не изменился', () => {
    const lex = vi.fn(markedEngine.lex)
    const doc = createMarkdownDocument({ engine: { lex } })

    doc.update('Текст.\n')
    doc.update('Текст.\n')
    doc.update('Текст.\n')

    expect(lex).toHaveBeenCalledTimes(1)
  })

  it('стриминг разбирает только хвост, а не весь документ заново', () => {
    const seen: number[] = []
    const doc = createMarkdownDocument({
      streaming: true,
      engine: {
        lex: (source, options) => {
          seen.push(source.length)
          return markedEngine.lex(source, options)
        },
      },
    })

    const head = 'Готовый абзац.\n\nВторой готовый абзац.\n\n'
    doc.update(head)
    seen.length = 0

    doc.update(`${head}Хвост`)
    doc.update(`${head}Хвост наби`)
    doc.update(`${head}Хвост набирается.`)

    // Каждый чанк стоит длины хвоста, а не длины документа.
    expect(Math.max(...seen)).toBeLessThan(head.length)
  })

  it('стриминг отдаёт то же дерево, что и полный разбор', () => {
    const source = 'Первый.\n\nВторой.\n\nТретий абзац целиком.\n'
    const doc = createMarkdownDocument({ streaming: true })

    doc.update('Первый.\n\nВторой.\n\n')
    const streamed = doc.update(source)

    expect(streamed.map(b => b.key)).toEqual(keys(source))
    expect(streamed.map(b => [b.offset, b.end])).toEqual(parseMarkdown(source).map(b => [b.offset, b.end]))
  })

  it('определение в хвосте роняет хвостовой разбор: оно влияет на блоки выше', () => {
    const seen: number[] = []
    const doc = createMarkdownDocument({
      streaming: true,
      engine: {
        lex: (source, options) => {
          seen.push(source.length)
          return markedEngine.lex(source, options)
        },
      },
    })

    const head = 'Ссылка на [образец].\n\nВторой абзац.\n\n'
    doc.update(head)
    seen.length = 0

    const next = `${head}[образец]: https://example.com\n`
    doc.update(next)

    expect(seen).toEqual([next.length])
  })
})

describe('офсеты блоков', () => {
  it('идут по порядку, не пересекаются и начинаются с нуля', () => {
    const blocks = parseMarkdown('# Заголовок\n\nАбзац.\n\n- пункт\n- второй\n\n> цитата\n')

    expect(blocks[0]?.offset).toBe(0)
    for (let i = 1; i < blocks.length; i++)
      expect(blocks[i]!.offset).toBeGreaterThanOrEqual(blocks[i - 1]!.end)
  })

  it('срез по офсетам — это сам блок', () => {
    const source = '# Заголовок\n\nАбзац про дело.\n'
    const [heading, paragraph] = parseMarkdown(source)

    expect(source.slice(heading!.offset, heading!.end)).toContain('# Заголовок')
    expect(source.slice(paragraph!.offset, paragraph!.end)).toContain('Абзац про дело.')
  })

  it('офсет задачи указывает на сам маркер — без него эмит бесполезен', () => {
    const source = '- [ ] не сделано\n- [x] сделано\n'
    const list = parseMarkdown(source)[0]?.node

    expect(list?.type).toBe('list')
    if (list?.type !== 'list')
      return

    const [todo, done] = list.items
    expect(todo!.taskOffset).toBe(source.indexOf('[ ]'))
    expect(done!.taskOffset).toBe(source.indexOf('[x]'))
    expect(source.slice(done!.taskOffset!, done!.taskOffset! + 3)).toBe('[x]')
  })

  it('офсет верен и у вложенной задачи', () => {
    // `raw` вложенного списка приезжает без отступа, поэтому накопление длин
    // промахивалось на всё снятое выше и указывало в чужую строку.
    const source = '- [ ] внешняя\n  - [ ] вложенная\n  - [x] вторая вложенная\n- [x] последняя\n'
    const found = taskItems(parseMarkdown(source).map(block => block.node))

    expect(found).toHaveLength(4)
    expect(found.map(item => item.taskOffset)).toEqual(markerPositions(source))
  })

  it('офсет верен у задачи внутри цитаты', () => {
    const source = '> - [ ] в цитате\n> - [x] тоже\n'
    const found = taskItems(parseMarkdown(source).map(block => block.node))

    expect(found).toHaveLength(2)
    expect(found.map(item => item.taskOffset)).toEqual(markerPositions(source))
  })

  it('одинаковые пункты не схлопываются в один офсет', () => {
    const source = '- [ ] дело\n- [ ] дело\n  - [ ] дело\n'
    const found = taskItems(parseMarkdown(source).map(block => block.node))

    expect(found.map(item => item.taskOffset)).toEqual(markerPositions(source))
  })

  it('задача без опоры в исходнике офсета не выдумывает', () => {
    // Сноска разбирается вне основного потока, и куска исходника под ней нет:
    // честнее отдать `null`, чем число, по которому перепишут не тот текст.
    const source = 'Текст[^a]\n\n[^a]: - [ ] в сноске\n'
    const blocks = parseMarkdown(source)
    const footnotes = blocks.flatMap(block => block.node.type === 'footnotes' ? block.node.items : [])
    const found = taskItems(footnotes.flatMap(item => item.children))

    expect(found).toHaveLength(1)
    expect(found[0]!.taskOffset).toBeNull()
  })

  // Каждый случай — своя причина, по которой наивное накопление длин промахивалось.
  const TASK_SHAPES: [name: string, source: string][] = [
    ['три уровня вложенности', '- [ ] a\n  - [ ] b\n    - [x] c\n'],
    ['нумерованный с вложенным', '1. [ ] раз\n2. [x] два\n   1. [ ] вложенный\n'],
    ['смешанные маркеры', '* [ ] звёздочка\n  + [x] плюс\n    - [ ] дефис\n'],
    ['отступ табуляцией', '- [ ] a\n\t- [x] b\n'],
    ['вложенная цитата', '> > - [ ] дважды\n> > - [x] второй\n'],
    ['цитата с вложенным списком', '> - [ ] внешний\n>   - [x] вложенный\n'],
    ['продолжение строки', '- [ ] первая\n  вторая строка\n  - [x] вложенный\n'],
    ['абзац между пунктами', '- [ ] один\n\n  абзац внутри\n\n  - [x] вложенный\n\n- [ ] два\n'],
    ['лестница на пять уровней', '- [ ] 1\n  - [ ] 2\n    - [ ] 3\n      - [ ] 4\n        - [x] 5\n'],
  ]

  it.each(TASK_SHAPES)('офсет указывает на маркер своего пункта: %s', (_name, source) => {
    const found = taskItems(parseMarkdown(source).map(block => block.node))
    expect(found.length).toBeGreaterThan(1)

    const offsets = found.map((item) => {
      expect(item.taskOffset).not.toBeNull()
      // Маркер — и сразу за ним текст именно этого пункта: одного совпадения
      // с любым маркером мало, промах как раз попадал в чужую строку.
      expect(source.slice(item.taskOffset!, item.taskOffset! + 3)).toMatch(/^\[[ x]\]$/i)
      const lead = leadText(item).split('\n')[0]!.trim()
      expect(source.slice(item.taskOffset! + 4).trimStart().startsWith(lead)).toBe(true)
      return item.taskOffset!
    })

    expect(offsets).toEqual([...offsets].sort((a, b) => a - b))
    expect(new Set(offsets).size).toBe(offsets.length)
  })

  it('маркер в блоке кода задачей не считается', () => {
    const source = '```\n- [ ] не задача\n```\n\n- [x] задача\n'
    const found = taskItems(parseMarkdown(source).map(block => block.node))

    expect(found).toHaveLength(1)
    expect(found[0]!.taskOffset).toBe(source.lastIndexOf('[x]'))
  })

  it('литерал в прозе не сдвигает офсет задачи', () => {
    const source = 'В тексте [x] буквально.\n\n- [ ] настоящая\n'
    const found = taskItems(parseMarkdown(source).map(block => block.node))

    expect(found).toHaveLength(1)
    expect(found[0]!.taskOffset).toBe(source.indexOf('[ ]'))
  })
})
