import type { TokenizerAndRendererExtension } from 'marked'
import { describe, expect, it } from 'vitest'

import { createMarkedEngine } from '../engine/marked'
import { markdownPlainText } from '../plainText'
import type { GrMdBlockNode } from '../types'

/**
 * Точка расширения, обещанная докой: «математика и диаграммы — точки
 * расширения, а не состав набора». Шва под неё не было вовсе — движок не
 * принимал расширений, а незнакомый токен превращался в свой же исходный текст.
 */

/** Инлайновый токенайзер вроде `marked-katex-extension`. */
const inlineMath: TokenizerAndRendererExtension = {
  name: 'inlineMath',
  level: 'inline',
  start: (src: string) => src.indexOf('$'),
  tokenizer(src: string) {
    const match = /^\$([^$\n]+)\$/.exec(src)
    return match ? { type: 'inlineMath', raw: match[0], formula: match[1] } : undefined
  },
}

/** Блочный токенайзер вроде `marked-directive`. */
const callout: TokenizerAndRendererExtension = {
  name: 'callout',
  level: 'block',
  start: (src: string) => src.match(/^:::/m)?.index,
  tokenizer(src: string) {
    const match = /^:::(\w+)\n([\s\S]*?)\n:::\n?/.exec(src)
    if (!match)
      return undefined
    return { type: 'callout', raw: match[0], kind: match[1], tokens: this.lexer.blockTokens(`${match[2]}\n`) }
  },
}

function parse(source: string, extensions: TokenizerAndRendererExtension[]): GrMdBlockNode[] {
  return createMarkedEngine({ extensions }).lex(source, {}).map(block => block.node)
}

describe('расширения движка', () => {
  it('инлайновый токен приезжает узлом custom, а не текстом', () => {
    const node = parse('Формула $E = mc^2$ дальше.\n', [inlineMath])[0]

    expect(node?.type).toBe('paragraph')
    if (node?.type !== 'paragraph')
      return

    const custom = node.children.find(child => child.type === 'custom')
    expect(custom).toMatchObject({ type: 'custom', name: 'inlineMath', raw: '$E = mc^2$' })
    expect(custom?.type === 'custom' && custom.data).toEqual({ formula: 'E = mc^2' })
  })

  it('блочный токен тоже, и его содержимое разобрано', () => {
    const node = parse(':::warning\nБудьте **осторожны**.\n:::\n', [callout])[0]

    expect(node).toMatchObject({ type: 'custom', name: 'callout' })
    if (node?.type !== 'custom')
      return

    expect(node.data).toEqual({ kind: 'warning' })
    expect(node.children[0]?.type).toBe('paragraph')
  })

  it('служебные поля marked в data не протекают', () => {
    const node = parse('Формула $x$.\n', [inlineMath])[0]
    const custom = node?.type === 'paragraph' ? node.children.find(c => c.type === 'custom') : undefined

    expect(custom?.type === 'custom' && Object.keys(custom.data)).toEqual(['formula'])
  })

  it('без расширения тот же текст остаётся обычным текстом', () => {
    expect(markdownPlainText(createMarkedEngine().lex('Формула $E = mc^2$ дальше.\n', {})))
      .toBe('Формула $E = mc^2$ дальше.')
  })

  it('содержимое чужого узла доезжает до текста без разметки', () => {
    const blocks = createMarkedEngine({ extensions: [callout] }).lex(':::note\nВажное.\n:::\n', {})
    expect(markdownPlainText(blocks)).toBe('Важное.')
  })

  it('сноски пакета продолжают работать рядом с чужим расширением', () => {
    const nodes = parse('Текст[^a].\n\n[^a]: Пояснение.\n', [inlineMath])
    expect(nodes.at(-1)?.type).toBe('footnotes')
  })
})
