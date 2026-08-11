import { describe, expect, it } from 'vitest'

import {
  type ComponentGraphSource,
  baseComponents,
  buildComponentGraph,
  focusSubgraph,
  layoutFocusSubgraph,
  mostDependedOn,
  transitiveDependencies,
} from '../componentDependencyGraph'

/**
 * Искусственный источник вместо реестра: правила обхода проверяются прямо, а не
 * подбором компонента, который их случайно покрывает. Реестр проверяется
 * отдельным блоком — там утверждения про форму графа, а не про алгоритм.
 */
const sample: ComponentGraphSource[] = [
  { name: 'Leaf', dependencies: [] },
  { name: 'Mid', dependencies: ['Leaf'] },
  { name: 'Top', dependencies: ['Mid', 'Leaf'] },
  { name: 'Sibling', dependencies: ['Leaf'] },
  { name: 'Foreign', dependencies: ['other:Thing', 'Missing'] },
]

describe('модель графа зависимостей', () => {
  it('считает уровень как самый длинный путь вниз', () => {
    const graph = buildComponentGraph(sample)

    expect(graph.byName.get('Leaf')?.level).toBe(0)
    expect(graph.byName.get('Mid')?.level).toBe(1)
    // Через `Mid` путь длиннее, чем прямое ребро `Top → Leaf`.
    expect(graph.byName.get('Top')?.level).toBe(2)
    expect(graph.levels[0]).toEqual(['Foreign', 'Leaf'])
  })

  it('строит обратный индекс', () => {
    const graph = buildComponentGraph(sample)

    expect(graph.byName.get('Leaf')?.dependents).toEqual(['Mid', 'Sibling', 'Top'])
    expect(graph.byName.get('Top')?.dependents).toEqual([])
  })

  it('отбрасывает зависимости вне реестра', () => {
    const graph = buildComponentGraph(sample)

    expect(graph.byName.get('Foreign')?.dependencies).toEqual([])
    expect(graph.edges.some(edge => edge.to === 'Missing')).toBe(false)
  })

  it('считает транзитивное замыкание без повторов', () => {
    const graph = buildComponentGraph(sample)

    expect(transitiveDependencies(graph, 'Top')).toEqual(['Leaf', 'Mid'])
    expect(graph.byName.get('Top')?.transitiveCount).toBe(2)
    expect(transitiveDependencies(graph, 'Leaf')).toEqual([])
  })

  it('не зацикливается на циклическом источнике', () => {
    const graph = buildComponentGraph([
      { name: 'A', dependencies: ['B'] },
      { name: 'B', dependencies: ['A'] },
    ])

    expect(graph.hasCycle).toBe(true)
    expect(transitiveDependencies(graph, 'A')).toEqual(['A', 'B'])
  })

  it('выделяет базовые и опорные компоненты', () => {
    const graph = buildComponentGraph(sample)

    expect(baseComponents(graph).map(node => node.name)).toEqual(['Foreign', 'Leaf'])
    expect(mostDependedOn(graph)[0]).toMatchObject({ name: 'Leaf' })
  })
})

describe('фокус-подграф', () => {
  const graph = buildComponentGraph(sample)

  it('раскладывает окрестность по колонкам вокруг фокуса', () => {
    const subgraph = focusSubgraph(graph, 'Mid')

    expect(subgraph.columns.get('Top')).toBe(-1)
    expect(subgraph.columns.get('Mid')).toBe(0)
    expect(subgraph.columns.get('Leaf')).toBe(1)
    expect(subgraph.nodes).toHaveLength(3)
  })

  it('ставит узел в колонку самого длинного пути от фокуса', () => {
    const subgraph = focusSubgraph(graph, 'Top')

    // `Leaf` достижим и напрямую, и через `Mid`: короткий путь нарисовал бы
    // ребро `Mid → Leaf` справа налево.
    expect(subgraph.columns.get('Mid')).toBe(1)
    expect(subgraph.columns.get('Leaf')).toBe(2)
    expect(subgraph.edges).toContainEqual({ from: 'Mid', to: 'Leaf' })
  })

  it('рисует только рёбра, идущие вправо', () => {
    const subgraph = focusSubgraph(graph, 'Leaf')

    expect(subgraph.nodes.sort()).toEqual(['Leaf', 'Mid', 'Sibling', 'Top'])
    // `Top → Mid` — связь внутри колонки зависимых, к сюжету не относится.
    expect(subgraph.edges).not.toContainEqual({ from: 'Top', to: 'Mid' })
    expect(subgraph.edges.every(edge => edge.to === 'Leaf')).toBe(true)
  })

  it('отдаёт пустой подграф на неизвестное имя', () => {
    expect(focusSubgraph(graph, 'Nope').nodes).toEqual([])
  })
})

describe('раскладка подграфа', () => {
  const graph = buildComponentGraph(sample)

  it('разносит колонки по x и центрирует их по вертикали', () => {
    const layout = layoutFocusSubgraph(focusSubgraph(graph, 'Leaf'))

    const columns = new Set(layout.nodes.map(node => node.x))
    expect(columns.size).toBe(2)

    const leaf = layout.nodes.find(node => node.name === 'Leaf')!
    const dependents = layout.nodes.filter(node => node.name !== 'Leaf')
    expect(dependents).toHaveLength(3)
    // Одинокий узел встаёт по центру колонки из трёх.
    expect(leaf.y).toBeCloseTo((layout.height - leaf.height) / 2)
  })

  it('держит все узлы внутри объявленного холста', () => {
    const layout = layoutFocusSubgraph(focusSubgraph(graph, 'Top'))

    for (const node of layout.nodes) {
      expect(node.x + node.width).toBeLessThanOrEqual(layout.width)
      expect(node.y + node.height).toBeLessThanOrEqual(layout.height + 0.001)
    }
    expect(layout.edges.every(edge => edge.from.x < edge.to.x)).toBe(true)
  })

  it('переживает пустой подграф', () => {
    const layout = layoutFocusSubgraph(focusSubgraph(graph, 'Nope'))

    expect(layout.nodes).toEqual([])
    expect(layout.width).toBe(0)
  })
})

describe('реестр пакета', () => {
  const graph = buildComponentGraph()

  it('не содержит циклов', () => {
    expect(graph.hasCycle).toBe(false)
  })

  it('держит сервис-хосты, которых нет в каталоге витрины', () => {
    // `GrDialogService` отфильтрован из каталога (у него нет `<Name>.vue`), но
    // в графе это самый глубокий узел — потерять его значит соврать про глубину.
    const serviceHost = graph.byName.get('GrDialogService')

    expect(serviceHost).toBeDefined()
    expect(serviceHost?.path).toBeUndefined()
    expect(serviceHost!.level).toBe(graph.levels.length - 1)
  })

  it('связывает узлы каталога с их карточками', () => {
    expect(graph.byName.get('GrButton')?.path).toBe('/components/gr-button')
  })

  it('опирается на базовые компоненты', () => {
    const base = baseComponents(graph)

    expect(base.length).toBeGreaterThan(0)
    expect(base.map(node => node.name)).toContain('GrIcon')
    expect(graph.byName.get('GrIcon')?.dependents.length).toBeGreaterThan(0)
  })
})
