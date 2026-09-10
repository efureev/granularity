import type { GrMdBlock, GrMdBlockNode, GrMdInline } from './types'

/** Текст без разметки: поиск по документу, превью в списке, доступное имя. */
export function markdownPlainText(blocks: GrMdBlock[]): string {
  return blocks.map(block => blockText(block.node)).filter(Boolean).join('\n\n')
}

function inlineText(nodes: GrMdInline[]): string {
  let out = ''
  for (const node of nodes) {
    switch (node.type) {
      case 'text': out += node.value; break
      case 'codeSpan': out += node.value; break
      case 'image': out += node.alt; break
      case 'br': out += ' '; break
      case 'footnoteRef': break
      case 'custom': out += node.children.length > 0 ? inlineText(node.children) : node.raw; break
      case 'strong':
      case 'em':
      case 'del':
      case 'link': out += inlineText(node.children)
    }
  }
  return out
}

function blockText(node: GrMdBlockNode): string {
  switch (node.type) {
    case 'heading':
    case 'paragraph':
    case 'inline':
      return inlineText(node.children)
    case 'code':
      return node.text
    case 'blockquote':
    case 'alert':
      return node.children.map(blockText).filter(Boolean).join('\n\n')
    case 'list':
      return node.items.map(item => item.children.map(blockText).filter(Boolean).join(' ')).join('\n')
    case 'table':
      return [node.header, ...node.rows]
        .map(row => row.map(cell => inlineText(cell.children)).join('\t'))
        .join('\n')
    case 'footnotes':
      return node.items.map(item => item.children.map(blockText).join(' ')).join('\n')
    case 'custom':
      return node.children.length > 0 ? node.children.map(blockText).filter(Boolean).join('\n\n') : node.raw
    case 'html':
    case 'hr':
      return ''
  }
}
