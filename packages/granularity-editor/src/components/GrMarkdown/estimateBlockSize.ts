import type { GrMdBlockNode, GrMdInline } from '../../markdown/types'

/**
 * Оценка высоты блока для `contain-intrinsic-size`.
 *
 * Нужна не ради красоты: с `content-visibility: auto` браузер не размечает то,
 * чего нет на экране, и без подсказки считает высоту нулевой — полоса прокрутки
 * скачет на каждом пролистывании. Промах в оценке стоит одного кадра, потому
 * что рядом стоит ключевое слово `auto`: фактический размер запоминается после
 * первой отрисовки.
 *
 * Числа — строки при средней ширине колонки, а не пиксели: результат уезжает в
 * `rem` и потому идёт за кеглем.
 */

const CHARS_PER_LINE = 68
const LINE = 1.6
const GAP = 1

function inlineLength(nodes: GrMdInline[]): number {
  let total = 0
  for (const node of nodes) {
    switch (node.type) {
      case 'text': total += node.value.length; break
      case 'codeSpan': total += node.value.length; break
      case 'image': total += node.alt.length; break
      case 'br': total += CHARS_PER_LINE; break
      case 'footnoteRef': total += 2; break
      case 'custom': total += node.children.length > 0 ? inlineLength(node.children) : node.raw.length; break
      case 'strong':
      case 'em':
      case 'del':
      case 'link': total += inlineLength(node.children)
    }
  }
  return total
}

function lines(chars: number): number {
  return Math.max(1, Math.ceil(chars / CHARS_PER_LINE))
}

function blockRem(node: GrMdBlockNode): number {
  switch (node.type) {
    case 'heading':
      return lines(inlineLength(node.children)) * (node.depth <= 2 ? 2 : 1.6) + GAP
    case 'paragraph':
    case 'inline':
      return lines(inlineLength(node.children)) * LINE + GAP
    case 'code':
      // Блок кода не переносит строки, поэтому считаем их, а не символы.
      return (node.text.split('\n').length + 1) * 1.5 + GAP
    case 'blockquote':
    case 'alert':
      return node.children.reduce((sum, child) => sum + blockRem(child), 0) + GAP
    case 'list':
      return node.items.reduce(
        (sum, item) => sum + item.children.reduce((inner, child) => inner + blockRem(child), 0),
        0,
      ) + GAP
    case 'table':
      return (node.rows.length + 1) * 2.4 + GAP
    case 'hr':
      return 2
    case 'html':
      return lines(node.value.length) * LINE + GAP
    case 'footnotes':
      return node.items.length * 2.4 + 3
    case 'custom':
      // Своего вида у чужого узла нет, поэтому считаем по объёму исходника:
      // промах стоит одного кадра, а `auto` запомнит настоящий размер.
      return node.children.length > 0
        ? node.children.reduce((sum, child) => sum + blockRem(child), 0)
        : lines(node.raw.length) * LINE + GAP
  }
}

export function estimateBlockSize(node: GrMdBlockNode): string {
  return `${Math.round(blockRem(node) * 10) / 10}rem`
}
