import type { GrTreeKey, GrTreeNode } from '../../components/GrTree/grTreeTypes'

/**
 * Состояние отметки узла. `half` — часть потомков отмечена: в ARIA это
 * `aria-checked="mixed"`.
 */
export const GR_TREE_CHECK_STATES = ['checked', 'half', 'unchecked'] as const

export type GrTreeCheckState = typeof GR_TREE_CHECK_STATES[number]

export type GrTreeCheckStates = Map<GrTreeKey, GrTreeCheckState>

/**
 * Раскладывает отмеченные ключи по всему дереву: родитель отмечен, когда
 * отмечены все дети, и наполовину — когда часть.
 *
 * Считается от листьев вверх, поэтому `checkedKeys` снаружи может содержать
 * только листья (типовой формат ответа сервера) — родители посчитаются сами.
 * При `strict` дерево не связывает узлы вовсе: каждый отвечает сам за себя.
 */
export function resolveCheckStates<T>(
  roots: GrTreeNode<T>[],
  checkedKeys: Set<GrTreeKey>,
  strict: boolean,
): GrTreeCheckStates {
  const states: GrTreeCheckStates = new Map()

  const walk = (node: GrTreeNode<T>): GrTreeCheckState => {
    if (strict || node.childNodes.length === 0) {
      const state: GrTreeCheckState = checkedKeys.has(node.key) ? 'checked' : 'unchecked'
      // В strict-режиме потомков всё равно нужно обойти: у них своё состояние.
      if (strict)
        node.childNodes.forEach(walk)
      states.set(node.key, state)
      return state
    }

    const childStates = node.childNodes.map(walk)
    const allChecked = childStates.every(s => s === 'checked')
    const someMarked = childStates.some(s => s !== 'unchecked')

    const state: GrTreeCheckState = allChecked
      ? 'checked'
      : (someMarked || checkedKeys.has(node.key) ? 'half' : 'unchecked')

    states.set(node.key, state)
    return state
  }

  roots.forEach(walk)
  return states
}

/**
 * Новый набор отмеченных ключей после переключения узла.
 *
 * Каскад идёт вниз (все потомки повторяют решение) и вверх (родитель отмечен,
 * только если отмечены все его дети). Возвращается набор с родителями —
 * `getCheckedKeys({ leafOnly: true })` при необходимости отбросит их обратно.
 */
export function toggleCheckedKeys<T>(
  roots: GrTreeNode<T>[],
  checkedKeys: Set<GrTreeKey>,
  node: GrTreeNode<T>,
  checked: boolean,
  strict: boolean,
): Set<GrTreeKey> {
  const next = new Set(checkedKeys)

  if (strict) {
    if (checked)
      next.add(node.key)
    else next.delete(node.key)
    return next
  }

  const applyDown = (target: GrTreeNode<T>): void => {
    if (checked)
      next.add(target.key)
    else next.delete(target.key)
    target.childNodes.forEach(applyDown)
  }
  applyDown(node)

  for (let parent = node.parent; parent; parent = parent.parent) {
    const allChecked = parent.childNodes.every(child => next.has(child.key))
    if (allChecked)
      next.add(parent.key)
    else next.delete(parent.key)
  }

  // Отметки узлов, которых уже нет в дереве, тянуть незачем.
  return pruneToTree(roots, next)
}

/** Отбрасывает ключи, которых нет в текущей модели (данные могли смениться). */
export function pruneToTree<T>(roots: GrTreeNode<T>[], keys: Set<GrTreeKey>): Set<GrTreeKey> {
  const known = new Set<GrTreeKey>()
  const walk = (node: GrTreeNode<T>): void => {
    known.add(node.key)
    node.childNodes.forEach(walk)
  }
  roots.forEach(walk)

  const next = new Set<GrTreeKey>()
  for (const key of keys) {
    if (known.has(key))
      next.add(key)
  }
  return next
}

/** Ключи в состоянии `checked`; `leafOnly` оставляет только листья. */
export function collectCheckedKeys<T>(
  roots: GrTreeNode<T>[],
  states: GrTreeCheckStates,
  leafOnly: boolean,
): GrTreeKey[] {
  const out: GrTreeKey[] = []

  const walk = (node: GrTreeNode<T>): void => {
    const isLeaf = node.childNodes.length === 0
    if (states.get(node.key) === 'checked' && (!leafOnly || isLeaf))
      out.push(node.key)
    node.childNodes.forEach(walk)
  }

  roots.forEach(walk)
  return out
}

/** Ключи в состоянии `half` — родители с частично отмеченными потомками. */
export function collectHalfCheckedKeys(states: GrTreeCheckStates): GrTreeKey[] {
  const out: GrTreeKey[] = []
  for (const [key, state] of states) {
    if (state === 'half')
      out.push(key)
  }
  return out
}
