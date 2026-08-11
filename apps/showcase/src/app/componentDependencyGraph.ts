import { granularityComponentConfigs } from '@feugene/granularity/granular-provider'

import { showcaseComponentEntities } from './showcaseEntities.ts'

/**
 * Граф строится по `config.dependencies` — это то, что компонент **рендерит**,
 * а не всё, что импортирует. Связи через контекст и композаблы
 * (`useGrComponentSize`, `useGrFormFieldContext`) рёбрами не являются: они не
 * тянут за собой чужую разметку, safelist и CSS. Критерий нормативен и живёт в
 * пресете (`docs/SPEC.md` §4.1), тот же используют гейты пакета.
 */
export interface ComponentGraphSource {
  name: string
  dependencies: readonly string[]
}

export interface ComponentGraphNode {
  name: string
  /** Что компонент рендерит напрямую. */
  dependencies: string[]
  /** Кто рендерит его самого. */
  dependents: string[]
  /** Длина самого длинного пути вниз; `0` — компонент ни от чего не зависит. */
  level: number
  /** Сколько компонентов приедет вместе с этим при гранулярной селекции. */
  transitiveCount: number
  /** Путь карточки в витрине; `undefined` у сервис-хостов без страницы. */
  path?: string
}

export interface ComponentGraph {
  nodes: ComponentGraphNode[]
  byName: Map<string, ComponentGraphNode>
  edges: Array<{ from: string, to: string }>
  /** Компоненты по уровням: `levels[0]` — базовые, без зависимостей. */
  levels: string[][]
  /** Есть ли в графе цикл. Сегодня `false`, но обход на это не опирается. */
  hasCycle: boolean
}

/**
 * Реестр провайдера, а не каталог витрины: каталог отфильтровывает сервис-хосты
 * без `<Name>.vue` (сегодня `GrDialogService`), а в графе зависимостей такой
 * компонент — самый глубокий узел, и терять его нельзя.
 */
export function componentGraphSource(): ComponentGraphSource[] {
  return Object.values(granularityComponentConfigs).map(config => ({
    name: config.name,
    dependencies: (config.dependencies ?? []).flatMap((dependency): string[] => (
      typeof dependency === 'string' ? [dependency] : []
    )),
  }))
}

export function buildComponentGraph(source: ComponentGraphSource[] = componentGraphSource()): ComponentGraph {
  const known = new Set(source.map(item => item.name))
  const pathByName = new Map(showcaseComponentEntities.map(entity => [entity.name, entity.path]))

  const dependencies = new Map<string, string[]>()
  const dependents = new Map<string, string[]>()
  for (const item of source) {
    dependencies.set(item.name, [])
    dependents.set(item.name, [])
  }

  const edges: Array<{ from: string, to: string }> = []
  for (const item of source) {
    for (const dependency of item.dependencies) {
      // Квалифицированная форма `providerId:Name` библиотекой не используется,
      // но реестр её допускает — чужой провайдер узлом нашего графа не станет.
      if (!known.has(dependency) || dependency === item.name)
        continue

      dependencies.get(item.name)!.push(dependency)
      dependents.get(dependency)!.push(item.name)
      edges.push({ from: item.name, to: dependency })
    }
  }

  const levels = new Map<string, number>()
  const state = new Map<string, 'visiting' | 'done'>()
  let hasCycle = false

  const resolveLevel = (name: string): number => {
    const cached = levels.get(name)
    if (cached !== undefined)
      return cached

    if (state.get(name) === 'visiting') {
      hasCycle = true
      return 0
    }

    state.set(name, 'visiting')
    const own = dependencies.get(name) ?? []
    const level = own.length ? 1 + Math.max(...own.map(resolveLevel)) : 0
    state.set(name, 'done')
    levels.set(name, level)

    return level
  }

  const nodes = source
    .map((item): ComponentGraphNode => ({
      name: item.name,
      dependencies: [...dependencies.get(item.name)!].sort(),
      dependents: [...dependents.get(item.name)!].sort(),
      level: resolveLevel(item.name),
      transitiveCount: collectTransitive(item.name, dependencies).size,
      path: pathByName.get(item.name),
    }))
    .sort((left, right) => left.name.localeCompare(right.name))

  const byLevel: string[][] = []
  for (const node of nodes)
    (byLevel[node.level] ??= []).push(node.name)

  return {
    nodes,
    byName: new Map(nodes.map(node => [node.name, node])),
    edges,
    levels: byLevel.map(names => [...names].sort()),
    hasCycle,
  }
}

function collectTransitive(
  name: string,
  dependencies: Map<string, string[]>,
  visited = new Set<string>(),
): Set<string> {
  for (const dependency of dependencies.get(name) ?? []) {
    if (visited.has(dependency))
      continue
    visited.add(dependency)
    collectTransitive(dependency, dependencies, visited)
  }

  return visited
}

/** Всё, что приедет вместе с компонентом при `components: [name]`. */
export function transitiveDependencies(graph: ComponentGraph, name: string): string[] {
  const dependencies = new Map(graph.nodes.map(node => [node.name, node.dependencies]))

  return [...collectTransitive(name, dependencies)].sort()
}

/** Компоненты, которые ни от чего не зависят. */
export function baseComponents(graph: ComponentGraph): ComponentGraphNode[] {
  return graph.nodes.filter(node => node.dependencies.length === 0)
}

/** Компоненты по убыванию числа зависимых — на ком держится библиотека. */
export function mostDependedOn(graph: ComponentGraph): ComponentGraphNode[] {
  return graph.nodes
    .filter(node => node.dependents.length > 0)
    .sort((left, right) => (
      right.dependents.length - left.dependents.length
      || left.name.localeCompare(right.name)
    ))
}

export interface FocusSubgraph {
  focus: string
  /** Колонка узла: `-1` — зависимые, `0` — сам компонент, дальше — вглубь. */
  columns: Map<string, number>
  nodes: string[]
  edges: Array<{ from: string, to: string }>
}

/**
 * Окрестность компонента: он сам, всё его транзитивное замыкание и прямые
 * зависимые. Даже у самого связного узла это ~11 компонентов — полотно из 67
 * с 66 рёбрами нечитаемо, а окрестность отвечает на оба вопроса разом.
 */
export function focusSubgraph(graph: ComponentGraph, focus: string): FocusSubgraph {
  const node = graph.byName.get(focus)
  if (!node)
    return { focus, columns: new Map(), nodes: [], edges: [] }

  const columns = new Map<string, number>([[focus, 0]])
  for (const dependent of node.dependents)
    columns.set(dependent, -1)

  // Колонка = самый длинный путь от фокуса. Он гарантирует, что ребро всегда
  // идёт слева направо: `GrButton` достижим из `GrPromptDialog` и напрямую (1),
  // и через `GrDialog` (2) — по кратчайшему пути ребро шло бы справа налево.
  const depths = new Map<string, number>([[focus, 0]])
  const walk = (name: string, depth: number, trail: Set<string>): void => {
    if (trail.has(name))
      return

    trail.add(name)
    for (const dependency of graph.byName.get(name)?.dependencies ?? []) {
      if ((depths.get(dependency) ?? -1) < depth + 1)
        depths.set(dependency, depth + 1)
      walk(dependency, depth + 1, trail)
    }
    trail.delete(name)
  }
  walk(focus, 0, new Set())

  for (const [name, depth] of depths) {
    if (name !== focus)
      columns.set(name, depth)
  }

  const nodes = [...columns.keys()]
  // Ребро рисуется, только если оно идёт строго вправо. Отсекает связи внутри
  // колонки зависимых: она отвечает на «кто меня использует», а не «как они
  // связаны между собой», и стрелки внутри неё читались бы как часть замыкания.
  const edges = graph.edges.filter(edge => (
    columns.has(edge.from)
    && columns.has(edge.to)
    && columns.get(edge.from)! < columns.get(edge.to)!
  ))

  return { focus, columns, nodes, edges }
}

export interface SubgraphLayoutNode {
  name: string
  x: number
  y: number
  width: number
  height: number
  column: number
}

export interface SubgraphLayout {
  nodes: SubgraphLayoutNode[]
  edges: Array<{ from: SubgraphLayoutNode, to: SubgraphLayoutNode }>
  width: number
  height: number
}

const NODE_WIDTH = 168
const NODE_HEIGHT = 34
const COLUMN_GAP = 56
const ROW_GAP = 14

/**
 * Раскладка отделена от разметки: ошибка в координатах проявляется не
 * исключением, а «немного не тем» рисунком, и ловится только тестом.
 */
export function layoutFocusSubgraph(subgraph: FocusSubgraph): SubgraphLayout {
  const byColumn = new Map<number, string[]>()
  for (const name of subgraph.nodes) {
    const column = subgraph.columns.get(name) ?? 0
    const names = byColumn.get(column) ?? []
    names.push(name)
    byColumn.set(column, names)
  }
  for (const names of byColumn.values())
    names.sort()

  const columnIndexes = [...byColumn.keys()].sort((left, right) => left - right)
  const rows = Math.max(1, ...[...byColumn.values()].map(names => names.length))
  const height = rows * NODE_HEIGHT + (rows - 1) * ROW_GAP

  const placed = new Map<string, SubgraphLayoutNode>()
  columnIndexes.forEach((column, index) => {
    const names = byColumn.get(column)!
    const columnHeight = names.length * NODE_HEIGHT + (names.length - 1) * ROW_GAP
    const offset = (height - columnHeight) / 2

    names.forEach((name, row) => {
      placed.set(name, {
        name,
        column,
        x: index * (NODE_WIDTH + COLUMN_GAP),
        y: offset + row * (NODE_HEIGHT + ROW_GAP),
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
      })
    })
  })

  return {
    nodes: [...placed.values()],
    edges: subgraph.edges
      .filter(edge => placed.has(edge.from) && placed.has(edge.to))
      .map(edge => ({ from: placed.get(edge.from)!, to: placed.get(edge.to)! })),
    width: columnIndexes.length * NODE_WIDTH + Math.max(0, columnIndexes.length - 1) * COLUMN_GAP,
    height,
  }
}
