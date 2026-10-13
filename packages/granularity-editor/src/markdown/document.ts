import { markedEngine } from './engine/marked'
import { markdownHeadings } from './headings'
import type { GrMarkdownEngine, GrMarkdownParseOptions, GrMdBlock, GrMdBlockNode, GrMdHeading } from './types'

export interface GrMarkdownDocumentOptions extends GrMarkdownParseOptions {
  engine?: GrMarkdownEngine
  /**
   * Источник дописывается в конец — ответ языковой модели.
   *
   * Включает разбор только хвоста: перелексить весь документ на каждый чанк
   * можно, но цена тогда растёт с длиной уже написанного.
   */
  streaming?: boolean
}

/**
 * Определение — ссылочное или сноски, — приехавшее в хвосте, влияет на блоки
 * выше. Стабильного префикса в таком документе нет, и хвостовой разбор
 * отключается целиком: неверная ссылка дороже лишнего прохода.
 */
const BACK_REFERENCING = /^\s{0,3}\[[^\]\n]+\]:/m

export interface GrMarkdownDocument {
  update: (source: string) => GrMdBlock[]
  readonly blocks: GrMdBlock[]
  readonly headings: GrMdHeading[]
}

export function createMarkdownDocument(options: GrMarkdownDocumentOptions = {}): GrMarkdownDocument {
  const engine = options.engine ?? markedEngine
  const parseOptions: GrMarkdownParseOptions = {
    html: options.html,
    allowedProtocols: options.allowedProtocols,
    idPrefix: options.idPrefix,
    preset: options.preset,
  }

  let source = ''
  let blocks: GrMdBlock[] = []

  /**
   * Офсеты задач хвоста считаны от начала хвоста, а `taskToggle` обещает офсет
   * в исходнике целиком: без сдвига переключение задачи из потока указывало бы
   * на чужие символы.
   */
  function shiftTaskOffsets(node: GrMdBlockNode, delta: number): GrMdBlockNode {
    switch (node.type) {
      case 'list':
        return {
          ...node,
          items: node.items.map(item => ({
            ...item,
            taskOffset: item.taskOffset === null ? null : item.taskOffset + delta,
            children: item.children.map(child => shiftTaskOffsets(child, delta)),
          })),
        }
      case 'blockquote':
      case 'alert':
      case 'custom':
        return { ...node, children: node.children.map(child => shiftTaskOffsets(child, delta)) }
      case 'heading':
      case 'paragraph':
      case 'inline':
      case 'code':
      case 'table':
      case 'hr':
      case 'html':
      case 'footnotes':
        return node
    }
  }

  function full(next: string): GrMdBlock[] {
    return engine.lex(next, parseOptions)
  }

  /**
   * Хвостовой разбор.
   *
   * Граница — начало последнего блока: всё выше него дописыванием в конец
   * измениться не могло. Заголовки и сноски отбирают эту возможность, потому
   * что их нумерация сквозная по документу.
   */
  function tail(next: string): GrMdBlock[] | null {
    if (blocks.length < 2)
      return null
    if (BACK_REFERENCING.test(next))
      return null
    if (blocks.some(block => block.node.type === 'footnotes' || block.node.type === 'heading'))
      return null

    const last = blocks[blocks.length - 1]
    if (!last)
      return null

    const head = blocks.slice(0, -1)
    const from = last.offset
    const parsed = engine.lex(next.slice(from), parseOptions)

    return [
      ...head,
      ...parsed.map(block => ({
        ...block,
        offset: block.offset + from,
        end: block.end + from,
        node: shiftTaskOffsets(block.node, from),
      })),
    ]
  }

  return {
    update(next: string): GrMdBlock[] {
      if (next === source)
        return blocks

      const canStream = options.streaming === true && next.length > source.length && next.startsWith(source)
      blocks = (canStream ? tail(next) : null) ?? full(next)
      source = next
      return blocks
    },
    get blocks() {
      return blocks
    },
    get headings() {
      return markdownHeadings(blocks)
    },
  }
}

/** Разовый разбор — когда инкрементальность не нужна (сервер, тест, превью). */
export function parseMarkdown(source: string, options: GrMarkdownParseOptions = {}): GrMdBlock[] {
  return markedEngine.lex(source, options)
}
