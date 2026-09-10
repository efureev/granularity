import { describe, expect, it, vi } from 'vitest'

import { createMarkdownDocument, parseMarkdown } from '../document'
import { markedEngine } from '../engine/marked'

const keys = (source: string) => parseMarkdown(source).map(block => block.key)

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
})
