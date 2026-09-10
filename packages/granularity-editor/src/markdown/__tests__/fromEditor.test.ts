import { describe, expect, it } from 'vitest'

import { parseMarkdown } from '../document'
import { markdownFromEditorDocument } from '../fromEditor'
import { markdownPlainText } from '../plainText'
import type { GrEditorNode } from '../fromEditor'

const doc = (...content: GrEditorNode[]): GrEditorNode => ({ type: 'doc', content })
function text(value: string, marks?: string[]): GrEditorNode {
  return {
    type: 'text',
    text: value,
    ...(marks ? { marks: marks.map(type => ({ type })) } : {}),
  }
}
const para = (...content: GrEditorNode[]): GrEditorNode => ({ type: 'paragraph', content })

describe('документ редактора → markdown', () => {
  it('абзацы разделяются пустой строкой', () => {
    expect(markdownFromEditorDocument(doc(para(text('Первый')), para(text('Второй')))))
      .toBe('Первый\n\nВторой')
  })

  it('заголовки получают решётки по уровню', () => {
    expect(markdownFromEditorDocument(doc(
      { type: 'heading', attrs: { level: 2 }, content: [text('Раздел')] },
      { type: 'heading', attrs: { level: 3 }, content: [text('Подраздел')] },
    ))).toBe('## Раздел\n\n### Подраздел')
  })

  it('начертания оборачиваются своими знаками', () => {
    expect(markdownFromEditorDocument(doc(para(
      text('обычный '),
      text('жирный', ['bold']),
      text(' и '),
      text('курсив', ['italic']),
      text(' и '),
      text('зачёркнутый', ['strike']),
    )))).toBe('обычный **жирный** и *курсив* и ~~зачёркнутый~~')
  })

  it('код в строке не экранируется внутри — там всё буквально', () => {
    expect(markdownFromEditorDocument(doc(para(text('a * b', ['code'])))))
      .toBe('`a * b`')
  })

  it('ссылка собирается из марки', () => {
    expect(markdownFromEditorDocument(doc(para({
      type: 'text',
      text: 'сайт',
      marks: [{ type: 'link', attrs: { href: 'https://example.com' } }],
    })))).toBe('[сайт](https://example.com)')
  })

  it('списки нумеруются и отбиваются маркером', () => {
    expect(markdownFromEditorDocument(doc({
      type: 'bulletList',
      content: [
        { type: 'listItem', content: [para(text('один'))] },
        { type: 'listItem', content: [para(text('два'))] },
      ],
    }))).toBe('- один\n- два')

    expect(markdownFromEditorDocument(doc({
      type: 'orderedList',
      attrs: { start: 3 },
      content: [{ type: 'listItem', content: [para(text('третий'))] }],
    }))).toBe('3. третий')
  })

  it('цитата получает угол на каждой строке', () => {
    expect(markdownFromEditorDocument(doc({
      type: 'blockquote',
      content: [para(text('первая')), para(text('вторая'))],
    }))).toBe('> первая\n>\n> вторая')
  })

  it('блок кода сохраняет язык и текст как есть', () => {
    expect(markdownFromEditorDocument(doc({
      type: 'codeBlock',
      attrs: { language: 'ts' },
      content: [{ type: 'text', text: 'const x = 1' }],
    }))).toBe('```ts\nconst x = 1\n```')
  })

  it('пустой документ даёт пустую строку, а не пробелы', () => {
    expect(markdownFromEditorDocument(doc(para()))).toBe('')
    expect(markdownFromEditorDocument(null)).toBe('')
  })
})

describe('круг: редактор → markdown → дерево', () => {
  it('текст переживает дорогу туда и обратно', () => {
    const source = markdownFromEditorDocument(doc(
      { type: 'heading', attrs: { level: 2 }, content: [text('Заголовок')] },
      para(text('Абзац с '), text('выделением', ['bold']), text('.')),
    ))

    expect(markdownPlainText(parseMarkdown(source))).toBe('Заголовок\n\nАбзац с выделением.')
  })

  it('звёздочка в тексте не превращается в разметку на обратном разборе', () => {
    const source = markdownFromEditorDocument(doc(para(text('2 * 2 и _подчерк_'))))
    expect(markdownPlainText(parseMarkdown(source))).toBe('2 * 2 и _подчерк_')
  })
})
