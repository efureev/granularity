import type { ComputedRef, MaybeRefOrGetter, Ref, ShallowRef } from 'vue'
import { computed, ref, shallowRef, toValue, watch } from 'vue'
import type {
  GrTreeKey,
  GrTreeNode,
  GrTreeNodeDropType,
  GrTreeNodeTarget,
} from './grTreeTypes'
import type { GrTreeDataAdapter } from './grTreeDataAdapter'
import type { GrTreeDataProps, GrTreeFilterNodeMethod } from './grTreeProps'

type TreeModel<T extends object> = {
  roots: GrTreeNode<T>[]
  byKey: Map<GrTreeKey, GrTreeNode<T>>
  byData: WeakMap<T, GrTreeNode<T>>
}

type FilterInfo = {
  isActive: boolean
  subtreeHasMatch: Map<GrTreeKey, boolean>
  matchedKeys: Set<GrTreeKey>
  autoExpandKeys: Set<GrTreeKey>
}

export type GrTreeStoreOptions<T extends object> = {
  data: MaybeRefOrGetter<GrTreeDataProps<T>['data']>
  defaultExpandedKeys?: MaybeRefOrGetter<GrTreeDataProps<T>['defaultExpandedKeys']>
  filterNodeMethod?: MaybeRefOrGetter<GrTreeFilterNodeMethod<T> | undefined>
  adapter: GrTreeDataAdapter<T>
}

export type GrTreeStore<T extends object> = {
  filterValue: Ref<string>
  expandedKeys: ShallowRef<Set<GrTreeKey>>
  currentKey: Ref<GrTreeKey | undefined>
  treeModel: ComputedRef<TreeModel<T>>
  filterInfo: ComputedRef<FilterInfo>
  filter: (value: string) => void
  isExpandedKey: (key: GrTreeKey) => boolean
  setExpandedKey: (key: GrTreeKey, expanded: boolean) => void
  toggleExpand: (node: GrTreeNode<T>) => void
  setCurrentKey: (key?: GrTreeKey) => void
  getCurrentKey: () => GrTreeKey | undefined
  getCurrentNode: () => GrTreeNode<T> | undefined
  setCurrentNode: (node?: GrTreeNodeTarget<T>) => boolean
  getNode: (key: GrTreeKey) => GrTreeNode<T> | undefined
  canMoveNode: (node: GrTreeNodeTarget<T>, referenceNode: GrTreeNodeTarget<T>, dropType: GrTreeNodeDropType) => boolean
  moveNode: (node: GrTreeNodeTarget<T>, referenceNode: GrTreeNodeTarget<T>, dropType: GrTreeNodeDropType) => GrTreeNode<T> | undefined
  appendNode: (data: T, parent: GrTreeNodeTarget<T>) => GrTreeNode<T> | undefined
  removeNode: (node: GrTreeNodeTarget<T>) => boolean
  insertNodeBefore: (data: T, referenceNode: GrTreeNodeTarget<T>) => GrTreeNode<T> | undefined
  insertNodeAfter: (data: T, referenceNode: GrTreeNodeTarget<T>) => GrTreeNode<T> | undefined
}

export function createGrTreeStore<T extends Record<string, any> = any>(
  options: GrTreeStoreOptions<T>,
): GrTreeStore<T> {
  const filterValue = ref('')
  const expandedKeys = shallowRef<Set<GrTreeKey>>(new Set())
  const currentKey = ref<GrTreeKey | undefined>(undefined)
  const getData = () => toValue(options.data) ?? []
  const getFilterNodeMethod = () => toValue(options.filterNodeMethod)

  watch(
    () => toValue(options.defaultExpandedKeys),
    (keys) => {
      expandedKeys.value = new Set(keys ?? [])
    },
    { immediate: true },
  )

  const treeModel = computed<TreeModel<T>>(() => {
    const byKey = new Map<GrTreeKey, GrTreeNode<T>>()
    const byData = new WeakMap<T, GrTreeNode<T>>()

    const build = (items: T[], parent: GrTreeNode<T> | undefined, level: number): GrTreeNode<T>[] => {
      return items.map((item, index) => {
        const node: GrTreeNode<T> = {
          key: options.adapter.getNodeKey(item, index, parent?.key),
          label: options.adapter.getLabel(item),
          data: item,
          level,
          parent,
          childNodes: [],
        }

        byKey.set(node.key, node)
        byData.set(item, node)
        node.childNodes = build(options.adapter.getChildren(item), node, level + 1)

        return node
      })
    }

    return {
      roots: build(getData(), undefined, 1),
      byKey,
      byData,
    }
  })

  const filterInfo = computed<FilterInfo>(() => {
    const value = filterValue.value
    const isActive = value.trim().length > 0
    const valueLower = value.toLowerCase()
    const subtreeHasMatch = new Map<GrTreeKey, boolean>()
    const matchedKeys = new Set<GrTreeKey>()
    const autoExpandKeys = new Set<GrTreeKey>()

    if (!isActive) {
      return {
        isActive,
        subtreeHasMatch,
        matchedKeys,
        autoExpandKeys,
      }
    }

    const match = (node: GrTreeNode<T>): boolean => {
      const filterNodeMethod = getFilterNodeMethod()
      if (filterNodeMethod)
        return filterNodeMethod(value, node.data, node)

      return node.label.toLowerCase().includes(valueLower)
    }

    const walk = (nodes: GrTreeNode<T>[]): boolean => {
      let any = false

      for (const node of nodes) {
        const self = match(node)
        const childAny = walk(node.childNodes)
        const has = self || childAny

        subtreeHasMatch.set(node.key, has)

        if (self)
          matchedKeys.add(node.key)

        if (childAny)
          autoExpandKeys.add(node.key)

        any ||= has
      }

      return any
    }

    walk(treeModel.value.roots)

    return {
      isActive,
      subtreeHasMatch,
      matchedKeys,
      autoExpandKeys,
    }
  })

  function getNode(key: GrTreeKey) {
    return treeModel.value.byKey.get(key)
  }

  function findNodeByData(data: T): GrTreeNode<T> | undefined {
    return treeModel.value.byData.get(data)
  }

  function isTreeNode(target: GrTreeNodeTarget<T>): target is GrTreeNode<T> {
    return typeof target === 'object'
      && target !== null
      && 'key' in target
      && 'data' in target
      && 'childNodes' in target
  }

  function resolveNodeTarget(target?: GrTreeNodeTarget<T>): GrTreeNode<T> | undefined {
    if (target == null)
      return undefined

    if (typeof target === 'string' || typeof target === 'number')
      return getNode(target)

    if (isTreeNode(target))
      return getNode(target.key) ?? target

    const key = options.adapter.getExplicitNodeKey(target)
    if (key != null)
      return getNode(key)

    return findNodeByData(target)
  }

  function getNodeContainer(node: GrTreeNode<T>) {
    const items = node.parent ? options.adapter.ensureChildren(node.parent.data) : getData()

    let index = items.findIndex(item => item === node.data)
    if (index >= 0)
      return { items, index }

    const key = options.adapter.getExplicitNodeKey(node.data)
    if (key == null)
      return undefined

    index = items.findIndex(item => options.adapter.getExplicitNodeKey(item) === key)
    if (index < 0)
      return undefined

    return { items, index }
  }

  function isDescendantNode(ancestor: GrTreeNode<T>, node: GrTreeNode<T>) {
    let current = node.parent

    while (current) {
      if (current.key === ancestor.key)
        return true

      current = current.parent
    }

    return false
  }

  function canMoveNode(node: GrTreeNodeTarget<T>, referenceNode: GrTreeNodeTarget<T>, dropType: GrTreeNodeDropType) {
    const sourceNode = resolveNodeTarget(node)
    const targetNode = resolveNodeTarget(referenceNode)

    if (!sourceNode || !targetNode)
      return false

    if (sourceNode.key === targetNode.key)
      return false

    if (isDescendantNode(sourceNode, targetNode))
      return false

    const sourceContainer = getNodeContainer(sourceNode)
    if (!sourceContainer)
      return false

    if (dropType === 'inner')
      return true

    return Boolean(getNodeContainer(targetNode))
  }

  function sanitizeTreeState() {
    const byKey = treeModel.value.byKey

    if (currentKey.value != null && !byKey.has(currentKey.value))
      currentKey.value = undefined

    const nextExpandedKeys = new Set(Array.from(expandedKeys.value).filter(key => byKey.has(key)))
    if (nextExpandedKeys.size !== expandedKeys.value.size)
      expandedKeys.value = nextExpandedKeys
  }

  function isExpandedKey(key: GrTreeKey): boolean {
    return expandedKeys.value.has(key)
  }

  function setExpandedKey(key: GrTreeKey, expanded: boolean) {
    const next = new Set(expandedKeys.value)

    if (expanded)
      next.add(key)
    else
      next.delete(key)

    expandedKeys.value = next
  }

  function toggleExpand(node: GrTreeNode<T>) {
    setExpandedKey(node.key, !isExpandedKey(node.key))
  }

  function setCurrentKey(key?: GrTreeKey) {
    currentKey.value = key
  }

  function getCurrentKey() {
    return currentKey.value
  }

  function getCurrentNode() {
    const key = currentKey.value
    return key == null ? undefined : getNode(key)
  }

  function setCurrentNode(node?: GrTreeNodeTarget<T>) {
    if (node == null) {
      currentKey.value = undefined
      return true
    }

    const targetNode = resolveNodeTarget(node)
    if (!targetNode)
      return false

    currentKey.value = targetNode.key
    return true
  }

  function resolveInsertedNode(data: T) {
    const key = options.adapter.getExplicitNodeKey(data)
    if (key != null)
      return getNode(key)

    return findNodeByData(data)
  }

  function moveNode(node: GrTreeNodeTarget<T>, referenceNode: GrTreeNodeTarget<T>, dropType: GrTreeNodeDropType) {
    const sourceNode = resolveNodeTarget(node)
    const targetNode = resolveNodeTarget(referenceNode)

    if (!sourceNode || !targetNode)
      return undefined

    if (!canMoveNode(sourceNode, targetNode, dropType))
      return undefined

    const sourceContainer = getNodeContainer(sourceNode)
    if (!sourceContainer)
      return undefined

    let destinationItems: T[]
    let destinationIndex: number

    if (dropType === 'inner') {
      destinationItems = options.adapter.ensureChildren(targetNode.data)
      destinationIndex = destinationItems.length
    }
    else {
      const targetContainer = getNodeContainer(targetNode)
      if (!targetContainer)
        return undefined

      destinationItems = targetContainer.items
      destinationIndex = dropType === 'prev'
        ? targetContainer.index
        : targetContainer.index + 1
    }

    if (destinationItems === sourceContainer.items && sourceContainer.index < destinationIndex)
      destinationIndex -= 1

    const [movedData] = sourceContainer.items.splice(sourceContainer.index, 1)
    destinationItems.splice(destinationIndex, 0, movedData)

    if (dropType === 'inner')
      setExpandedKey(targetNode.key, true)

    sanitizeTreeState()
    return resolveInsertedNode(movedData)
  }

  function appendNode(data: T, parent: GrTreeNodeTarget<T>) {
    const parentNode = resolveNodeTarget(parent)
    if (!parentNode)
      return undefined

    options.adapter.ensureChildren(parentNode.data).push(data)
    setExpandedKey(parentNode.key, true)
    sanitizeTreeState()
    return resolveInsertedNode(data)
  }

  function removeNode(node: GrTreeNodeTarget<T>) {
    if (!options.adapter.hasNodeKey())
      return false

    const targetNode = resolveNodeTarget(node)
    if (!targetNode)
      return false

    const container = getNodeContainer(targetNode)
    if (!container)
      return false

    container.items.splice(container.index, 1)
    sanitizeTreeState()
    return true
  }

  function insertNodeBefore(data: T, referenceNode: GrTreeNodeTarget<T>) {
    const targetNode = resolveNodeTarget(referenceNode)
    if (!targetNode)
      return undefined

    const container = getNodeContainer(targetNode)
    if (!container)
      return undefined

    container.items.splice(container.index, 0, data)
    sanitizeTreeState()
    return resolveInsertedNode(data)
  }

  function insertNodeAfter(data: T, referenceNode: GrTreeNodeTarget<T>) {
    const targetNode = resolveNodeTarget(referenceNode)
    if (!targetNode)
      return undefined

    const container = getNodeContainer(targetNode)
    if (!container)
      return undefined

    container.items.splice(container.index + 1, 0, data)
    sanitizeTreeState()
    return resolveInsertedNode(data)
  }

  function filter(value: string) {
    filterValue.value = value
  }

  return {
    filterValue,
    expandedKeys,
    currentKey,
    treeModel,
    filterInfo,
    filter,
    isExpandedKey,
    setExpandedKey,
    toggleExpand,
    setCurrentKey,
    getCurrentKey,
    getCurrentNode,
    setCurrentNode,
    getNode,
    canMoveNode,
    moveNode,
    appendNode,
    removeNode,
    insertNodeBefore,
    insertNodeAfter,
  }
}