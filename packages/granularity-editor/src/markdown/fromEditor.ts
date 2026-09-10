/**
 * Документ редактора → markdown.
 *
 * Вторая половина моста: разбор markdown был у слоя с самого начала, обратной
 * дороги не было. Лексер её и не даёт — он парсер и работает в одну сторону.
 *
 * Функция ходит по **обычному JSON**, а не по инстансу ProseMirror: `@tiptap/*`
 * здесь не импортируется вовсе. Поэтому слой остаётся тем же, чем был, —
 * без Vue, без DOM и без тяжёлых зависимостей, — а сериализация проверяется
 * без поднятия редактора.
 */

export interface GrEditorMark {
  type: string
  attrs?: Record<string, unknown>
}

export interface GrEditorNode {
  type: string
  attrs?: Record<string, unknown>
  content?: GrEditorNode[]
  marks?: GrEditorMark[]
  text?: string
}

/** Порядок важен: внешние обёртки идут раньше внутренних. */
const MARK_WRAPPERS: Array<[string, string]> = [
  ['bold', '**'],
  ['italic', '*'],
  ['strike', '~~'],
]

/**
 * Экранируется только то, что иначе стало бы разметкой при обратном разборе.
 *
 * Список намеренно узкий: экранировать всё подряд — значит засыпать текст
 * обратными косыми там, где markdown и так прочитает его буквально.
 */
function escapeInline(text: string): string {
  return text.replace(/[\\`*_[\]]/g, match => `\\${match}`)
}

/** В начале строки эти знаки открывают блок, поэтому гасятся отдельно. */
function escapeLineStarts(text: string): string {
  return text.replace(/^(\s*)([#>-]|\d+\.)(\s)/gm, (_, indent: string, token: string, tail: string) =>
    `${indent}\\${token}${tail}`)
}

function serializeText(node: GrEditorNode): string {
  const marks = node.marks ?? []
  let text = node.text ?? ''

  // Код в строке экранирования не терпит: внутри него всё буквально.
  if (marks.some(mark => mark.type === 'code'))
    return `\`${text}\``

  text = escapeLineStarts(escapeInline(text))

  for (const [type, wrapper] of MARK_WRAPPERS) {
    if (marks.some(mark => mark.type === type))
      text = `${wrapper}${text}${wrapper}`
  }

  const link = marks.find(mark => mark.type === 'link')
  if (link) {
    const href = String(link.attrs?.href ?? '')
    const title = link.attrs?.title ? ` "${String(link.attrs.title)}"` : ''
    text = `[${text}](${href}${title})`
  }

  return text
}

function serializeInline(nodes: GrEditorNode[] | undefined): string {
  if (!nodes)
    return ''

  return nodes.map((node) => {
    if (node.type === 'text')
      return serializeText(node)
    if (node.type === 'hardBreak')
      return '\\\n'
    if (node.type === 'image') {
      const alt = String(node.attrs?.alt ?? '')
      const src = String(node.attrs?.src ?? '')
      return `![${alt}](${src})`
    }
    return serializeInline(node.content)
  }).join('')
}

function prefixLines(text: string, first: string, rest: string): string {
  return text.split('\n').map((line, index) => (
    line === '' && index > 0 ? rest.trimEnd() : `${index === 0 ? first : rest}${line}`
  )).join('\n')
}

function serializeList(node: GrEditorNode, depth: number): string {
  const ordered = node.type === 'orderedList'
  const start = typeof node.attrs?.start === 'number' ? node.attrs.start : 1

  return (node.content ?? []).map((item, index) => {
    const marker = ordered ? `${start + index}. ` : '- '
    const body = (item.content ?? []).map(child => serializeBlock(child, depth + 1)).join('\n\n')
    return prefixLines(body, marker, ' '.repeat(marker.length))
  }).join('\n')
}

function serializeBlock(node: GrEditorNode, depth = 0): string {
  switch (node.type) {
    case 'paragraph':
      return serializeInline(node.content)

    case 'heading': {
      const level = typeof node.attrs?.level === 'number' ? node.attrs.level : 1
      return `${'#'.repeat(Math.min(6, Math.max(1, level)))} ${serializeInline(node.content)}`
    }

    case 'bulletList':
    case 'orderedList':
      return serializeList(node, depth)

    case 'blockquote':
      return prefixLines((node.content ?? []).map(child => serializeBlock(child, depth)).join('\n\n'), '> ', '> ')

    case 'codeBlock': {
      const language = String(node.attrs?.language ?? '')
      const text = (node.content ?? []).map(child => child.text ?? '').join('')
      return `\`\`\`${language}\n${text}\n\`\`\``
    }

    case 'horizontalRule':
      return '---'

    default:
      return node.content ? (node.content).map(child => serializeBlock(child, depth)).join('\n\n') : serializeInline([node])
  }
}

/**
 * Документ редактора в markdown.
 *
 * Пустой абзац — единственный узел пустого документа — даёт пустую строку, а
 * не строку из пробелов: иначе «пустое поле» перестало бы быть пустым.
 */
export function markdownFromEditorDocument(document: GrEditorNode | null | undefined): string {
  if (!document?.content)
    return ''

  return document.content
    .map(node => serializeBlock(node))
    .filter(block => block.trim() !== '')
    .join('\n\n')
}
