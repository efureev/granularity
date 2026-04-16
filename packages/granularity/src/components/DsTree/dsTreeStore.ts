import type { ComputedRef, MaybeRefOrGetter, Ref, ShallowRef } from 'vue'
import { computed, ref, shallowRef, toValue, watch } from 'vue'
import type {
  DsTreeKey,
  DsTreeNode,
  DsTreeNodeDropType,
  DsTreeNodeTarget,
} from './dsTreeTypes'
import type { DsTreeDataAdapter } from './dsTreeDataAdapter'
import type { DsTreeDataProps, DsTreeFilterNodeMethod } from './dsTreeProps'

type TreeModel<T extends object> = {
  roots: DsTreeNode<T>[]
  byKey: Map<DsTreeKey, DsTreeNode<T>>
  byData: WeakMap<T, DsTreeNode<T>>
}

type FilterInfo = {
  isActive: boolean
  subtreeHasMatch: Map<DsTreeKey, boolean>
  matchedKeys: Set<DsTreeKey>
  autoExpandKeys: Set<DsTreeKey>
}

export type DsTreeStoreOptions<T extends object> = {
  data: MaybeRefOrGetter<DsTreeDataProps<T>['data']>
  defaultExpandedKeys?: MaybeRefOrGetter<DsTreeDataProps<T>['defaultExpandedKeys']>
  filterNodeMethod?: MaybeRefOrGetter<DsTreeFilterNodeMethod<T> | undefined>
  adapter: DsTreeDataAdapter<T>
}

export type DsTreeStore<T extends object> = {
  filterValue: Ref<string>
  expandedKeys: ShallowRef<Set<DsTreeKey>>
  currentKey: Ref<DsTreeKey | undefined>
  treeModel: ComputedRef<TreeModel<T>>
  filterInfo: ComputedRef<FilterInfo>
  filter: (value: string) => void
  isExpandedKey: (key: DsTreeKey) => boolean
  setExpandedKey: (key: DsTreeKey, expanded: boolean) => void
  toggleExpand: (node: DsTreeNode<T>) => void
  setCurrentKey: (key?: DsTreeKey) => void
  getCurrentKey: () => DsTreeKey | undefined
  getCurrentNode: () => DsTreeNode<T> | undefined
  setCurrentNode: (node?: DsTreeNodeTarget<T>) => boolean
  getNode: (key: DsTreeKey) => DsTreeNode<T> | undefined
  canMoveNode: (node: DsTreeNodeTarget<T>, referenceNode: DsTreeNodeTarget<T>, dropType: DsTreeNodeDropType) => boolean
  moveNode: (node: DsTreeNodeTarget<T>, referenceNode: DsTreeNodeTarget<T>, dropType: DsTreeNodeDropType) => DsTreeNode<T> | undefined
  appendNode: (data: T, parent: DsTreeNodeTarget<T>) => DsTreeNode<T> | undefined
  removeNode: (node: DsTreeNodeTarget<T>) => boolean
  insertNodeBefore: (data: T, referenceNode: DsTreeNodeTarget<T>) => DsTreeNode<T> | undefined
  insertNodeAfter: (data: T, referenceNode: DsTreeNodeTarget<T>) => DsTreeNode<T> | undefined
}

export function createDsTreeStore<T extends Record<string, any> = any>(
  options: DsTreeStoreOptions<T>,
): DsTreeStore<T> {
  const filterValue = ref('')
  const expandedKeys = shallowRef<Set<DsTreeKey>>(new Set())
  const currentKey = ref<DsTreeKey | undefined>(undefined)
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
    const byKey = new Map<DsTreeKey, DsTreeNode<T>>()
    const byData = new WeakMap<T, DsTreeNode<T>>()

    const build = (items: T[], parent: DsTreeNode<T> | undefined, level: number): DsTreeNode<T>[] => {
      return items.map((item, index) => {
        const node: DsTreeNode<T> = {
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
    const subtreeHasMatch = new Map<DsTreeKey, boolean>()
    const matchedKeys = new Set<DsTreeKey>()
    const autoExpandKeys = new Set<DsTreeKey>()

    if (!isActive) {
      return {
        isActive,
        subtreeHasMatch,
        matchedKeys,
        autoExpandKeys,
      }
    }

    const match = (node: DsTreeNode<T>): boolean => {
      const filterNodeMethod = getFilterNodeMethod()
      if (filterNodeMethod)
        return filterNodeMethod(value, node.data, node)

      return node.label.toLowerCase().includes(valueLower)
    }

    const walk = (nodes: DsTreeNode<T>[]): boolean => {
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

  function getNode(key: DsTreeKey) {
    return treeModel.value.byKey.get(key)
  }

  function findNodeByData(data: T): DsTreeNode<T> | undefined {
    return treeModel.value.byData.get(data)
  }

  function isTreeNode(target: DsTreeNodeTarget<T>): target is DsTreeNode<T> {
    return typeof target === 'object'
      && target !== null
      && 'key' in target
      && 'data' in target
      && 'childNodes' in target
  }

  function resolveNodeTarget(target?: DsTreeNodeTarget<T>): DsTreeNode<T> | undefined {
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

  function getNodeContainer(node: DsTreeNode<T>) {
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

  function isDescendantNode(ancestor: DsTreeNode<T>, node: DsTreeNode<T>) {
    let current = node.parent

    while (current) {
      if (current.key === ancestor.key)
        return true

      current = current.parent
    }

    return false
  }

  function canMoveNode(node: DsTreeNodeTarget<T>, referenceNode: DsTreeNodeTarget<T>, dropType: DsTreeNodeDropType) {
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

  function isExpandedKey(key: DsTreeKey): boolean {
    return expandedKeys.value.has(key)
  }

  function setExpandedKey(key: DsTreeKey, expanded: boolean) {
    const next = new Set(expandedKeys.value)

    if (expanded)
      next.add(key)
    else
      next.delete(key)

    expandedKeys.value = next
  }

  function toggleExpand(node: DsTreeNode<T>) {
    setExpandedKey(node.key, !isExpandedKey(node.key))
  }

  function setCurrentKey(key?: DsTreeKey) {
    currentKey.value = key
  }

  function getCurrentKey() {
    return currentKey.value
  }

  function getCurrentNode() {
    const key = currentKey.value
    return key == null ? undefined : getNode(key)
  }

  function setCurrentNode(node?: DsTreeNodeTarget<T>) {
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

  function moveNode(node: DsTreeNodeTarget<T>, referenceNode: DsTreeNodeTarget<T>, dropType: DsTreeNodeDropType) {
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

  function appendNode(data: T, parent: DsTreeNodeTarget<T>) {
    const parentNode = resolveNodeTarget(parent)
    if (!parentNode)
      return undefined

    options.adapter.ensureChildren(parentNode.data).push(data)
    setExpandedKey(parentNode.key, true)
    sanitizeTreeState()
    return resolveInsertedNode(data)
  }

  function removeNode(node: DsTreeNodeTarget<T>) {
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

  function insertNodeBefore(data: T, referenceNode: DsTreeNodeTarget<T>) {
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

  function insertNodeAfter(data: T, referenceNode: DsTreeNodeTarget<T>) {
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