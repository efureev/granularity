import type { ComputedRef, MaybeRefOrGetter, Ref, ShallowRef } from 'vue'
import { computed, ref, shallowRef, toValue, watch } from 'vue'
import type {
  GrTreeKey,
  GrTreeNode,
  GrTreeNodeDropType,
  GrTreeNodeTarget,
} from '../components/GrTree/grTreeTypes'
import type { GrTreeDataAdapter } from './internal/treeAdapter'
import { createGrTreeDataAdapter } from './internal/treeAdapter'
import type { GrTreeDataProps, GrTreeLoad, GrTreePropsMap, GrTreeVisibleRow } from '../components/GrTree/grTreeProps'
import type { GrTreeCheckState, GrTreeCheckStates } from './internal/treeChecking'
import {
  collectCheckedKeys,
  collectHalfCheckedKeys,
  pruneToTree,
  resolveCheckStates,
  toggleCheckedKeys,
} from './internal/treeChecking'

export type GrTreeModel<T extends object> = {
  roots: GrTreeNode<T>[]
  byKey: Map<GrTreeKey, GrTreeNode<T>>
  byData: WeakMap<T, GrTreeNode<T>>
}

export type GrTreeFilterInfo = {
  isActive: boolean
  subtreeHasMatch: Map<GrTreeKey, boolean>
  matchedKeys: Set<GrTreeKey>
  autoExpandKeys: Set<GrTreeKey>
}

export type UseTreeOptions<T extends object> = {
  data: MaybeRefOrGetter<GrTreeDataProps<T>['data']>
  defaultExpandedKeys?: MaybeRefOrGetter<GrTreeDataProps<T>['defaultExpandedKeys']>
  defaultExpandAll?: MaybeRefOrGetter<boolean | undefined>
  /**
   * Совпал ли узел с запросом фильтра.
   *
   * Обычная функция, а не `MaybeRefOrGetter`: `toValue` не отличает геттер от
   * значения-функции и вызвал бы её вместо того, чтобы вернуть. Реактивность
   * при этом не теряется — потребитель читает своё состояние внутри вызова.
   */
  /**
   * Совпал ли узел с запросом. Вернуть `undefined` — оставить решение модели
   * (подстрочный матч по подписи).
   */
  filterNodeMethod?: (value: string, data: T, node: GrTreeNode<T>) => boolean | undefined
  defaultCheckedKeys?: MaybeRefOrGetter<GrTreeKey[] | undefined>
  /** Внешние отмеченные ключи (`v-model:checked-keys`), если потребитель их ведёт. */
  checkedKeys?: MaybeRefOrGetter<GrTreeKey[] | undefined>
  checkStrictly?: MaybeRefOrGetter<boolean | undefined>
  lazy?: MaybeRefOrGetter<boolean | undefined>
  /** Загрузка детей ветки. Обычная функция — по той же причине, что `filterNodeMethod`. */
  load?: GrTreeLoad<T>
  /** Форма данных: поля детей, подписи и признака листа. */
  props?: GrTreePropsMap
  /** Поле-идентификатор узла. */
  nodeKey?: GrTreeDataProps<T>['nodeKey']
  /**
   * Готовый адаптер. Не задан — собирается из `props` и `nodeKey`.
   *
   * Необязателен намеренно: фабрика адаптера наружу не публикуется, и
   * требовать её значило бы сделать композабл невызываемым вне пакета.
   * Компонент передаёт свой, потому что уже собрал его для себя.
   */
  adapter?: GrTreeDataAdapter<T>
  /**
   * Цвет направляющей уровня для узла. Не задан — `branchColors` у строк
   * остаётся пустым: направляющие рисует потребитель, и модель о них не знает.
   *
   * Обычная функция, а не `MaybeRefOrGetter`: `toValue` не отличает геттер от
   * значения-функции и вызвал бы её вместо того, чтобы вернуть.
   */
  branchColorFor?: (node: GrTreeNode<T>) => string | undefined | null
}

export type UseTreeReturn<T extends object> = {
  filterValue: Ref<string>
  expandedKeys: ShallowRef<Set<GrTreeKey>>
  checkedKeys: ShallowRef<Set<GrTreeKey>>
  checkStates: ComputedRef<GrTreeCheckStates>
  loadingKeys: ShallowRef<Set<GrTreeKey>>
  loadedKeys: ShallowRef<Set<GrTreeKey>>
  loadedChildren: ShallowRef<Map<GrTreeKey, T[]>>
  currentKey: Ref<GrTreeKey | undefined>
  /**
   * Видимые строки одним плоским списком в порядке отображения — то, из чего
   * строится разметка. Иерархию несут `node.level`, `posInSet` и `setSize`:
   * в плоском DOM группы нет, и структуру диктору сообщают они.
   */
  visibleRows: ComputedRef<GrTreeVisibleRow<T>[]>
  treeModel: ComputedRef<GrTreeModel<T>>
  filterInfo: ComputedRef<GrTreeFilterInfo>
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
  getCheckState: (key: GrTreeKey) => GrTreeCheckState
  setChecked: (node: GrTreeNodeTarget<T>, checked: boolean) => GrTreeNode<T> | undefined
  toggleChecked: (node: GrTreeNode<T>) => GrTreeNode<T> | undefined
  getCheckedKeys: (options?: { leafOnly?: boolean }) => GrTreeKey[]
  setCheckedKeys: (keys: GrTreeKey[]) => void
  getHalfCheckedKeys: () => GrTreeKey[]
  /** Лист ли узел с точки зрения раскрытия: в ленивом режиме решают данные и факт загрузки. */
  isLeafNode: (node: GrTreeNode<T>) => boolean
  isLoadingKey: (key: GrTreeKey) => boolean
  /** Грузит детей ветки, если это нужно и ещё не делалось. */
  ensureLoaded: (node: GrTreeNode<T>) => void
}

export function useTree<T extends object>(
  options: UseTreeOptions<T>,
): UseTreeReturn<T> {
  const adapter = options.adapter
    ?? createGrTreeDataAdapter<T>({ props: options.props, nodeKey: options.nodeKey })

  const filterValue = ref('')
  const expandedKeys = shallowRef<Set<GrTreeKey>>(new Set())
  const checkedKeys = shallowRef<Set<GrTreeKey>>(new Set(toValue(options.defaultCheckedKeys) ?? []))
  const loadingKeys = shallowRef<Set<GrTreeKey>>(new Set())
  const loadedKeys = shallowRef<Set<GrTreeKey>>(new Set())
  // Дети, пришедшие ленивой загрузкой, живут в сторе, а не в данных потребителя:
  // `data` — обычный проп и реактивным быть не обязан, а дерево обязано
  // показать загруженное в любом случае.
  const loadedChildren = shallowRef<Map<GrTreeKey, T[]>>(new Map())
  const currentKey = ref<GrTreeKey | undefined>(undefined)
  const getData = () => toValue(options.data) ?? []
  const getFilterNodeMethod = () => options.filterNodeMethod

  watch(
    () => toValue(options.defaultExpandedKeys),
    (keys) => {
      expandedKeys.value = new Set(keys ?? [])
    },
    { immediate: true },
  )

  // Внешние отметки: компонент управляемый, пока проп задан. Не задан — ведёт
  // набор сам, начиная с `defaultCheckedKeys`.
  watch(
    () => toValue(options.checkedKeys),
    (keys) => {
      if (keys)
        checkedKeys.value = new Set(keys)
    },
    { immediate: true },
  )

  const treeModel = computed<GrTreeModel<T>>(() => {
    const byKey = new Map<GrTreeKey, GrTreeNode<T>>()
    const byData = new WeakMap<T, GrTreeNode<T>>()

    const build = (items: T[], parent: GrTreeNode<T> | undefined, level: number): GrTreeNode<T>[] => {
      return items.map((item, index) => {
        const node: GrTreeNode<T> = {
          key: adapter.getNodeKey(item, index, parent?.key),
          label: adapter.getLabel(item),
          data: item,
          level,
          parent,
          childNodes: [],
        }

        byKey.set(node.key, node)
        byData.set(item, node)

        const ownChildren = adapter.getChildren(item)
        const lazyChildren = loadedChildren.value.get(node.key) ?? []
        node.childNodes = build([...ownChildren, ...lazyChildren], node, level + 1)

        return node
      })
    }

    return {
      roots: build(getData(), undefined, 1),
      byKey,
      byData,
    }
  })

  // `defaultExpandAll` раскрывает узел один раз — в момент его появления в
  // данных. Иначе любое обновление `data` отменяло бы всё, что пользователь
  // свернул руками.
  const autoExpandedKeys = new Set<GrTreeKey>()
  watch(treeModel, (model) => {
    if (!toValue(options.defaultExpandAll))
      return

    const next = new Set(expandedKeys.value)
    let changed = false

    for (const key of model.byKey.keys()) {
      if (autoExpandedKeys.has(key))
        continue

      autoExpandedKeys.add(key)
      next.add(key)
      changed = true
    }

    if (changed)
      expandedKeys.value = next
  }, { immediate: true })

  const filterInfo = computed<GrTreeFilterInfo>(() => {
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
      // `undefined` от метода означает «решай сам»: обёртка компонента отдаёт
      // его, когда своего правила потребитель не задал, — иначе она не смогла
      // бы вернуть модель к дефолту, оставаясь обычной функцией.
      const custom = getFilterNodeMethod()?.(value, node.data, node)

      if (custom !== undefined)
        return custom

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

    const key = adapter.getExplicitNodeKey(target)
    if (key != null)
      return getNode(key)

    return findNodeByData(target)
  }

  function getNodeContainer(node: GrTreeNode<T>) {
    const items = node.parent ? adapter.ensureChildren(node.parent.data) : getData()

    let index = items.findIndex(item => item === node.data)
    if (index >= 0)
      return { items, index }

    const key = adapter.getExplicitNodeKey(node.data)
    if (key == null)
      return undefined

    index = items.findIndex(item => adapter.getExplicitNodeKey(item) === key)
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

    const nextCheckedKeys = new Set(Array.from(checkedKeys.value).filter(key => byKey.has(key)))
    if (nextCheckedKeys.size !== checkedKeys.value.size)
      checkedKeys.value = nextCheckedKeys
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
    const key = adapter.getExplicitNodeKey(data)
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
      destinationItems = adapter.ensureChildren(targetNode.data)
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

    adapter.ensureChildren(parentNode.data).push(data)
    setExpandedKey(parentNode.key, true)
    sanitizeTreeState()
    return resolveInsertedNode(data)
  }

  function removeNode(node: GrTreeNodeTarget<T>) {
    if (!adapter.hasNodeKey())
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

  // ————— Отметки (чекбоксы).

  const checkStates = computed<GrTreeCheckStates>(() => resolveCheckStates(
    treeModel.value.roots,
    checkedKeys.value,
    Boolean(toValue(options.checkStrictly)),
  ))

  function getCheckState(key: GrTreeKey): GrTreeCheckState {
    return checkStates.value.get(key) ?? 'unchecked'
  }

  function setChecked(node: GrTreeNodeTarget<T>, checked: boolean) {
    const targetNode = resolveNodeTarget(node)
    if (!targetNode)
      return undefined

    checkedKeys.value = toggleCheckedKeys(
      treeModel.value.roots,
      checkedKeys.value,
      targetNode,
      checked,
      Boolean(toValue(options.checkStrictly)),
    )

    return targetNode
  }

  function toggleChecked(node: GrTreeNode<T>) {
    return setChecked(node, getCheckState(node.key) !== 'checked')
  }

  function getCheckedKeys(opts?: { leafOnly?: boolean }) {
    return collectCheckedKeys(treeModel.value.roots, checkStates.value, Boolean(opts?.leafOnly))
  }

  function setCheckedKeys(keys: GrTreeKey[]) {
    checkedKeys.value = pruneToTree(treeModel.value.roots, new Set(keys))
  }

  function getHalfCheckedKeys() {
    return collectHalfCheckedKeys(checkStates.value)
  }

  // ————— Ленивая подгрузка ветки.

  function isLeafNode(node: GrTreeNode<T>): boolean {
    if (node.childNodes.length > 0)
      return false

    if (!toValue(options.lazy))
      return true

    const declared = adapter.getIsLeaf(node.data)
    if (declared !== undefined)
      return declared

    // Данные молчат: пока ветку не грузили, считаем её разворачиваемой —
    // иначе до первого запроса дело бы не дошло.
    return loadedKeys.value.has(node.key)
  }

  function isLoadingKey(key: GrTreeKey): boolean {
    return loadingKeys.value.has(key)
  }

  function markLoading(key: GrTreeKey, loading: boolean) {
    const next = new Set(loadingKeys.value)
    if (loading)
      next.add(key)
    else
      next.delete(key)
    loadingKeys.value = next
  }

  function ensureLoaded(node: GrTreeNode<T>) {
    const load = options.load
    if (!toValue(options.lazy) || !load)
      return

    if (loadedKeys.value.has(node.key) || loadingKeys.value.has(node.key) || isLeafNode(node))
      return

    markLoading(node.key, true)

    let settled = false
    load(node, (children) => {
      // Ответ приходит от потребителя: второй вызов `resolve` — его ошибка, но
      // дублировать детей из-за неё дерево не обязано.
      if (settled)
        return
      settled = true

      const next = new Map(loadedChildren.value)
      next.set(node.key, [...(children ?? [])])
      loadedChildren.value = next
      loadedKeys.value = new Set(loadedKeys.value).add(node.key)
      markLoading(node.key, false)
    })
  }
  function filter(value: string) {
    filterValue.value = value
  }

  /**
   * Плоско — потому что рекурсивный рендер стоил по инстансу компонента на
   * каждый раскрытый узел: дерево на 2 000 видимых строк превращалось в 2 000
   * компонентов со своими вычислениями и подписками.
   */
  const visibleRows = computed<GrTreeVisibleRow<T>[]>(() => {
    const { roots } = treeModel.value
    const { isActive, subtreeHasMatch, matchedKeys, autoExpandKeys } = filterInfo.value
    const rows: GrTreeVisibleRow<T>[] = []

    const walk = (nodes: GrTreeNode<T>[], ancestorColors: string[]): void => {
      const siblings = isActive ? nodes.filter(node => subtreeHasMatch.get(node.key)) : nodes

      siblings.forEach((node, index) => {
        const isLeaf = isLeafNode(node)
        const isExpanded = isExpandedKey(node.key) || (isActive && autoExpandKeys.has(node.key))

        rows.push({
          node,
          isExpanded,
          isLeaf,
          isMatched: matchedKeys.has(node.key),
          posInSet: index + 1,
          setSize: siblings.length,
          isLoading: isLoadingKey(node.key),
          branchColors: ancestorColors,
        })

        if (!isExpanded || node.childNodes.length === 0)
          return

        const color = options.branchColorFor?.(node)

        walk(node.childNodes, color ? [...ancestorColors, color] : ancestorColors)
      })
    }

    walk(roots, [])

    return rows
  })

  return {
    visibleRows,
    filterValue,
    expandedKeys,
    loadedChildren,
    checkedKeys,
    checkStates,
    loadingKeys,
    loadedKeys,
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
    getCheckState,
    setChecked,
    toggleChecked,
    getCheckedKeys,
    setCheckedKeys,
    getHalfCheckedKeys,
    isLeafNode,
    isLoadingKey,
    ensureLoaded,
  }
}
