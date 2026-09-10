import type { TokenizerAndRendererExtension } from 'marked'

/**
 * Сноски — своим расширением, потому что `marked` их не знает вовсе.
 *
 * Альтернатива — пакет `marked-footnote` — стоила бы второй рантайм-зависимости
 * ради шестидесяти строк. Расширение при этом ничего не ломает в главном
 * инварианте: склейка `raw` всех токенов по-прежнему совпадает с исходником
 * побайтово, а на ней держится и кэш блоков, и офсеты.
 *
 * Ни один из двух токенов не рендерится сам: определения собираются в
 * синтетический блок `footnotes` в конце документа, ссылки получают номер по
 * **порядку первого упоминания** — так их нумерует GitHub.
 */

const DEFINITION = /^\[\^([^\]\n]+)\]:[ \t]*([^\n]*(?:\n(?![ \t]*\n|\[\^)[^\n]*)*)\n?/
const REFERENCE = /^\[\^([^\]\n]+)\]/

export const footnoteDefinition: TokenizerAndRendererExtension = {
  name: 'grFootnoteDefinition',
  level: 'block',
  start(src: string) {
    return src.match(/^\[\^/m)?.index
  },
  tokenizer(src: string) {
    const match = DEFINITION.exec(src)
    if (!match?.[1] || match[2] === undefined)
      return undefined

    return {
      type: 'grFootnoteDefinition',
      raw: match[0],
      label: match[1],
      // Тело сноски — полноценные блоки: в ней бывает и список, и код.
      tokens: this.lexer.blockTokens(`${match[2].trim()}\n`),
    }
  },
}

export const footnoteReference: TokenizerAndRendererExtension = {
  name: 'grFootnoteReference',
  level: 'inline',
  start(src: string) {
    const at = src.indexOf('[^')
    return at === -1 ? undefined : at
  },
  tokenizer(src: string) {
    const match = REFERENCE.exec(src)
    if (!match?.[1])
      return undefined

    return { type: 'grFootnoteReference', raw: match[0], label: match[1] }
  },
}

export const footnoteExtensions = [footnoteDefinition, footnoteReference]
