import { Comment, Fragment, Text, type VNode } from 'vue'

/**
 * Разбор содержимого слота.
 *
 * Общий модуль, а не приватные функции внутри SFC: то же самое нужно и
 * `GrFileUpload` («слот с кастомным UI или просто текст»), и `GrList` («в
 * списке пусто»). Импорт из чужой компонентной директории на сборке дал бы
 * ребро между компонентами, которого в разметке нет.
 */

/** `v-for` и `<template>` приходят фрагментами — разворачиваем до реальных узлов. */
export function flattenSlotNodes(nodes: VNode[]): VNode[] {
  const out: VNode[] = []

  for (const node of nodes) {
    if (node.type === Fragment && Array.isArray(node.children)) {
      out.push(...flattenSlotNodes(node.children as VNode[]))
      continue
    }

    out.push(node)
  }

  return out
}

export function isWhitespaceTextNode(node: VNode): boolean {
  if (node.type !== Text)
    return false
  return typeof node.children === 'string' && node.children.trim().length === 0
}

/**
 * Узлы, которые пользователь действительно видит: без комментариев (их
 * оставляет после себя каждый `v-if`) и без переносов строк из шаблона.
 */
export function meaningfulSlotNodes(nodes: VNode[]): VNode[] {
  return flattenSlotNodes(nodes).filter(node => node.type !== Comment && !isWhitespaceTextNode(node))
}

/** Есть ли в слоте хоть что-то, кроме комментариев и пробелов. */
export function hasMeaningfulSlotContent(nodes: VNode[]): boolean {
  return meaningfulSlotNodes(nodes).length > 0
}
