import { describe, expect, it } from 'vitest'

import { parseMarkdown } from '../document'
import { markdownPlainText } from '../plainText'
import type { GrMdBlockNode } from '../types'

function nodes(source: string, options = {}): GrMdBlockNode[] {
  return parseMarkdown(source, options).map(block => block.node)
}

function first(source: string, options = {}): GrMdBlockNode {
  const [node] = nodes(source, options)
  if (!node)
    throw new Error(`Разбор пуст: ${source}`)
  return node
}

describe('нормализация дерева', () => {
  it('узнаёт основные блоки', () => {
    expect(first('# Заголовок\n').type).toBe('heading')
    expect(first('Абзац.\n').type).toBe('paragraph')
    expect(first('```js\nx\n```\n').type).toBe('code')
    expect(first('> цитата\n').type).toBe('blockquote')
    expect(first('- пункт\n').type).toBe('list')
    expect(first('| a |\n| - |\n| 1 |\n').type).toBe('table')
    expect(first('---\n').type).toBe('hr')
  })

  it('язык блока кода берётся первым словом инфостроки', () => {
    expect(first('```ts twoslash\nx\n```\n')).toMatchObject({ type: 'code', lang: 'ts' })
    expect(first('```\nx\n```\n')).toMatchObject({ type: 'code', lang: null })
  })

  it('тесный и свободный списки различаются — от этого зависит их вид', () => {
    expect(first('- один\n- два\n')).toMatchObject({ type: 'list', tight: true })
    expect(first('- один\n\n- два\n')).toMatchObject({ type: 'list', tight: false })
  })

  it('пункт тесного списка — инлайн, а не абзац', () => {
    const list = first('- один\n')
    expect(list.type === 'list' && list.items[0]?.children[0]?.type).toBe('inline')
  })

  it('нумерованный список сохраняет начало', () => {
    expect(first('5. пять\n6. шесть\n')).toMatchObject({ type: 'list', ordered: true, start: 5 })
  })
})

describe('алерты GitHub', () => {
  it('цитата с маркером становится алертом своего тона', () => {
    for (const [marker, tone] of [['NOTE', 'note'], ['TIP', 'tip'], ['IMPORTANT', 'important'], ['WARNING', 'warning'], ['CAUTION', 'caution']] as const)
      expect(first(`> [!${marker}]\n> Текст.\n`)).toMatchObject({ type: 'alert', tone })
  })

  it('маркер снимается с текста, а не остаётся в нём', () => {
    expect(markdownPlainText(parseMarkdown('> [!NOTE]\n> Полезно знать.\n'))).toBe('Полезно знать.')
  })

  it('обычная цитата алертом не становится', () => {
    expect(first('> просто цитата\n').type).toBe('blockquote')
    expect(first('> [!НЕЧТО]\n> текст\n').type).toBe('blockquote')
  })
})

describe('сноски', () => {
  it('ссылка и определение сходятся в один блок внизу', () => {
    const parsed = nodes('Текст[^a] дальше.\n\n[^a]: Пояснение.\n')
    const footnotes = parsed.at(-1)

    expect(footnotes).toMatchObject({ type: 'footnotes' })
    if (footnotes?.type !== 'footnotes')
      return
    expect(footnotes.items).toHaveLength(1)
    expect(footnotes.items[0]).toMatchObject({ label: 'a', index: 1 })
  })

  it('нумерует по порядку первого упоминания, а не по порядку определений', () => {
    const parsed = nodes('Сначала[^второй] потом[^первый].\n\n[^первый]: П.\n[^второй]: В.\n')
    const footnotes = parsed.at(-1)

    expect(footnotes?.type === 'footnotes' && footnotes.items.map(i => [i.label, i.index]))
      .toEqual([['второй', 1], ['первый', 2]])
  })

  it('определение без ссылки в документ не попадает', () => {
    expect(nodes('Текст.\n\n[^нет]: Никто не сослался.\n').some(n => n.type === 'footnotes')).toBe(false)
  })
})

describe('сырой HTML', () => {
  it('по умолчанию остаётся текстом, а не разметкой', () => {
    const node = first('<script>alert(1)</script>\n')
    expect(node.type).toBe('html')
    expect(node.type === 'html' && node.value).toContain('<script>')
  })

  it('strip выбрасывает его вовсе', () => {
    expect(nodes('<script>alert(1)</script>\n', { html: 'strip' }).some(n => n.type === 'html')).toBe(false)
  })

  it('инлайновый HTML тоже остаётся текстом внутри абзаца', () => {
    // `<b>` — инлайновый уровень, блочным HTML-токеном становится только то,
    // что стоит отдельным блоком: `<script>`, `<div>`, `<table>`.
    expect(markdownPlainText(parseMarkdown('текст <b>жирный</b> дальше\n')))
      .toBe('текст <b>жирный</b> дальше')
  })

  it('strip убирает и инлайновый', () => {
    expect(markdownPlainText(parseMarkdown('текст <b>жирный</b> дальше\n', { html: 'strip' })))
      .toBe('текст жирный дальше')
  })
})

describe('пресеты', () => {
  it('commonmark не разбирает таблицы GFM', () => {
    expect(first('| a |\n| - |\n| 1 |\n', { preset: 'commonmark' }).type).not.toBe('table')
  })

  it('minimal превращает картинку в её подпись', () => {
    const node = first('![Схема сборки](/a.png)\n', { preset: 'minimal' })
    expect(node.type === 'paragraph' && node.children[0]).toEqual({ type: 'text', value: 'Схема сборки' })
  })
})

describe('сущности', () => {
  it('разворачиваются: дерево рисуется текстом, а не HTML', () => {
    expect(markdownPlainText(parseMarkdown('&amp; &mdash; &#x41;\n'))).toBe('& — A')
  })
})
