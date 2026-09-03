import { describe, expect, it } from 'vitest'

import {
  collectCheckedKeys,
  collectHalfCheckedKeys,
  pruneToTree,
  resolveCheckStates,
  toggleCheckedKeys,
} from '../../../composables/internal/treeChecking'
import type { GrTreeNode } from '../grTreeTypes'

/**
 * Каскад отметок — чистая арифметика по дереву, поэтому проверяется таблицей
 * входов без монтирования компонента.
 */
type Data = { id: number }

function node(key: number, children: GrTreeNode<Data>[] = [], parent?: GrTreeNode<Data>): GrTreeNode<Data> {
  const self: GrTreeNode<Data> = {
    key,
    label: `n${key}`,
    data: { id: key },
    level: parent ? parent.level + 1 : 1,
    parent,
    childNodes: [],
  }
  self.childNodes = children.map((child) => {
    child.parent = self
    child.level = self.level + 1
    return child
  })
  return self
}

/** parent(1) → [a(2) → [x(4), y(5)], b(3)] */
function sample() {
  const x = node(4)
  const y = node(5)
  const a = node(2, [x, y])
  const b = node(3)
  const root = node(1, [a, b])
  return { root, a, b, x, y, roots: [root] }
}

describe('grTreeChecking — состояния', () => {
  it('родитель отмечен, когда отмечены все дети', () => {
    const { roots, x, y } = sample()
    const states = resolveCheckStates(roots, new Set([x.key, y.key]), false)

    expect(states.get(2)).toBe('checked')
    expect(states.get(1)).toBe('half')
    expect(states.get(3)).toBe('unchecked')
  })

  it('часть отмеченных детей даёт родителю `half`', () => {
    const { roots, x } = sample()
    const states = resolveCheckStates(roots, new Set([x.key]), false)

    expect(states.get(2)).toBe('half')
    expect(states.get(1)).toBe('half')
  })

  it('в strict-режиме узлы не связаны', () => {
    const { roots, x, y } = sample()
    const states = resolveCheckStates(roots, new Set([x.key, y.key]), true)

    expect(states.get(2)).toBe('unchecked')
    expect(states.get(4)).toBe('checked')
  })
})

describe('grTreeChecking — переключение', () => {
  it('отметка родителя каскадится вниз и поднимает предков', () => {
    const { roots, a } = sample()
    const next = toggleCheckedKeys(roots, new Set(), a, true, false)

    expect([...next].sort()).toEqual([2, 4, 5])
    expect(resolveCheckStates(roots, next, false).get(1)).toBe('half')
  })

  it('снятие отметки у ребёнка снимает её с предков', () => {
    const { roots, a, x } = sample()
    const checked = toggleCheckedKeys(roots, new Set(), a, true, false)
    const next = toggleCheckedKeys(roots, checked, x, false, false)

    expect(next.has(2)).toBe(false)
    expect(next.has(5)).toBe(true)
  })

  it('strict переключает ровно один узел', () => {
    const { roots, a } = sample()
    const next = toggleCheckedKeys(roots, new Set(), a, true, true)

    expect([...next]).toEqual([2])
  })

  it('ключи исчезнувших узлов отбрасываются', () => {
    const { roots } = sample()
    expect([...pruneToTree(roots, new Set([1, 99]))]).toEqual([1])
  })
})

describe('grTreeChecking — выдача', () => {
  it('`leafOnly` убирает родителей, посчитанных каскадом', () => {
    const { roots, a } = sample()
    const checked = toggleCheckedKeys(roots, new Set(), a, true, false)
    const states = resolveCheckStates(roots, checked, false)

    expect(collectCheckedKeys(roots, states, false).sort()).toEqual([2, 4, 5])
    expect(collectCheckedKeys(roots, states, true).sort()).toEqual([4, 5])
    expect(collectHalfCheckedKeys(states)).toEqual([1])
  })
})
