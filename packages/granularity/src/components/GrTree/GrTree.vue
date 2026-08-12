<script setup lang="ts" generic="T extends Record<string, any> = any">
import { computed, nextTick, onBeforeUnmount, onUnmounted, ref } from 'vue'
import type {
  GrTreeAllowDropType,
  GrTreeInstance,
  GrTreeKey,
  GrTreeNode,
  GrTreeNodeDropType,
} from './grTreeTypes'
import { createGrTreeDataAdapter } from './grTreeDataAdapter'
import type { GrTreeDropTarget } from './grTreeInteractionContext'
import { createGrTreeInteractionContext } from './grTreeInteractionContext'
import type { GrTreeCheckState } from './grTreeChecking'
import { createGrTreeStore } from './grTreeStore'
import { treeSizeVars } from './grTreeStyles'
import { useGrComponentSize } from '../GrConfigProvider/context'
import { useAnnouncer } from '../../composables/useAnnouncer'
import { useDragSort } from '../../composables/useDragSort'
import { useRovingFocus } from '../../composables/useRovingFocus'
import { useVirtualList } from '../../composables/useVirtualList'
import { useGranularityTranslations } from '../../internal/granularityI18n'
import type {
  GrTreeBranchLineColor,
  GrTreeNodeClass,
  GrTreeProps,
  GrTreeVisibleRow,
} from './grTreeProps'

export interface GrTreeEmits<T extends Record<string, any> = any> {
  (e: 'nodeClick', data: T, node: GrTreeNode<T>): void
  (e: 'nodeExpand', data: T, node: GrTreeNode<T>): void
  (e: 'nodeCollapse', data: T, node: GrTreeNode<T>): void
  (e: 'nodeDrop', draggingNode: GrTreeNode<T>, dropNode: GrTreeNode<T>, dropType: GrTreeNodeDropType): void
  (e: 'nodeContextMenu', evt: MouseEvent, data: T, node: GrTreeNode<T>): void
  (e: 'update:checkedKeys', keys: GrTreeKey[]): void
  (e: 'check', data: T, node: GrTreeNode<T>, info: { checkedKeys: GrTreeKey[], halfCheckedKeys: GrTreeKey[] }): void
}

const DEFAULT_BRANCH_LINE_COLOR = 'var(--gr-tree-branch-line-default-color, var(--gr-brd))'

/** Стрелки, которые вместе с `Shift` двигают узел, а не фокус. */
const MOVE_KEYS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'])

const props = withDefaults(defineProps<GrTreeProps<T>>(), {
  props: () => ({
    children: 'children',
    label: 'label',
  }),
  nodeKey: 'id' as any,
  defaultExpandedKeys: () => [],
  defaultExpandAll: false,
  expandOnClickNode: false,
  accordion: false,
  size: undefined,
  highlightCurrent: true,
  indent: 0,
  virtual: false,
  maxHeight: undefined,
  showCheckbox: false,
  checkedKeys: undefined,
  defaultCheckedKeys: () => [],
  checkStrictly: false,
  lazy: false,
  load: undefined,
  expandIcon: 'i-lucide-chevron-right',
  collapseIcon: 'i-lucide-chevron-right',
  toggleIconRotate: true,
  branchLine: false,
  branchLineColor: undefined,
  branchLineActiveColor: undefined,
  draggable: false,
  dragHandleIcon: 'i-lucide-grip-vertical',
  dragLabel: undefined,
  expandLabel: undefined,
  collapseLabel: undefined,
  rowClass: undefined,
  dragHandleClass: undefined,
  toggleClass: undefined,
  toggleIconClass: undefined,
  toggleSpacerClass: undefined,
  contentClass: undefined,
})

const emit = defineEmits<GrTreeEmits<T>>()

defineSlots<{
  default?: (props: { node: GrTreeNode<T>; data: T }) => any
}>()

const dataAdapter = createGrTreeDataAdapter(props)
const treeStore = createGrTreeStore({
  adapter: dataAdapter,
  data: () => props.data,
  defaultExpandedKeys: () => props.defaultExpandedKeys,
  defaultExpandAll: () => props.defaultExpandAll,
  filterNodeMethod: () => props.filterNodeMethod,
  defaultCheckedKeys: () => props.defaultCheckedKeys,
  checkedKeys: () => props.checkedKeys,
  checkStrictly: () => props.checkStrictly,
  lazy: () => props.lazy,
  load: () => props.load,
})
const interactionContext = createGrTreeInteractionContext(props, {
  emitNodeClick: (data, node) => emit('nodeClick', data, node),
  emitNodeExpand: (data, node) => emit('nodeExpand', data, node),
  emitNodeCollapse: (data, node) => emit('nodeCollapse', data, node),
  emitNodeDrop: (draggingNode, dropNode, dropType) => emit('nodeDrop', draggingNode, dropNode, dropType),
  emitNodeContextMenu: (evt, data, node) => emit('nodeContextMenu', evt, data, node),
})

const treeProps = props as Readonly<GrTreeProps<T>>

const { t } = useGranularityTranslations()
const { announce } = useAnnouncer()
const dragLabel = computed(() => treeProps.dragLabel ?? t('gr.tree.drag', 'Drag'))
const expandLabel = computed(() => treeProps.expandLabel ?? t('gr.tree.expand', 'Expand'))
const collapseLabel = computed(() => treeProps.collapseLabel ?? t('gr.tree.collapse', 'Collapse'))
const currentKey = treeStore.currentKey
const hoveredKey = interactionContext.hoveredKey
const dropTarget = interactionContext.dropTarget

// Корневой элемент дерева — область для делегированной клавиатуры (WAI-ARIA tree).
const treeRootEl = ref<HTMLElement | null>(null)

/**
 * Видимые строки одним плоским списком в порядке отображения.
 *
 * Плоско — потому что рекурсивный рендер стоил по инстансу компонента на каждый
 * раскрытый узел: дерево на 2 000 видимых строк превращалось в 2 000
 * компонентов со своими вычислениями и подписками. Иерархию несут `aria-level`,
 * `aria-posinset` и `aria-setsize`, отступ — `padding-left` строки.
 */
const visibleRows = computed<GrTreeVisibleRow<T>[]>(() => {
  const { roots } = treeStore.treeModel.value
  const { isActive, subtreeHasMatch, matchedKeys, autoExpandKeys } = treeStore.filterInfo.value
  const branch = treeProps.branchLine
  const rows: GrTreeVisibleRow<T>[] = []

  const walk = (nodes: GrTreeNode<T>[], ancestorColors: string[]): void => {
    const siblings = isActive ? nodes.filter(node => subtreeHasMatch.get(node.key)) : nodes

    siblings.forEach((node, index) => {
      const isLeaf = treeStore.isLeafNode(node)
      const isExpanded = treeStore.isExpandedKey(node.key) || (isActive && autoExpandKeys.has(node.key))

      rows.push({
        node,
        isExpanded,
        isLeaf,
        isMatched: matchedKeys.has(node.key),
        posInSet: index + 1,
        setSize: siblings.length,
        isLoading: treeStore.isLoadingKey(node.key),
        branchColors: ancestorColors,
      })

      if (isExpanded && node.childNodes.length)
        walk(node.childNodes, branch ? [...ancestorColors, resolveBranchLineColor(node)] : ancestorColors)
    })
  }

  walk(roots, [])
  return rows
})

/**
 * Кольцо roving-фокуса: ровно один `treeitem` на всё дерево держит `tabindex=0`.
 *
 * Ориентация вертикальная намеренно: влево-вправо в дереве заняты раскрытием
 * ветки и переходом к родителю, и примитив их не трогает — это доменная логика,
 * она осталась в `onTreeKeydown`.
 */
const roving = useRovingFocus<GrTreeNode<T>['key']>({
  items: () => visibleRows.value.map(row => row.node.key),
  elementFor: key => interactionContext.nodeEls.get(key),
  orientation: () => 'vertical',
  // У дерева есть верх и низ: с последней строки вниз идти некуда.
  wrap: () => false,
  // Но клавишу на краю всё равно гасим: иначе `ArrowDown` на последнем узле
  // прокрутит страницу под деревом.
  onOverflow: () => true,
  // Пока фокус не трогали, остановку держит текущий (выбранный) узел, а если
  // его не видно — первая видимая строка.
  initialKey: () => currentKey.value ?? undefined,
  beforeFocus: key => scrollRowIntoView(key),
})

function onRowClick(node: GrTreeNode<T>) {
  treeStore.setCurrentKey(node.key)
  roving.setActive(node.key)
  interactionContext.emitNodeClick(node.data, node)
}

// Клик мышью, в отличие от Enter, умеет ещё и раскрывать узел: `Enter` в
// паттерне tree закреплён за выбором, и подмешивать в него раскрытие нельзя.
function onRowActivate(row: GrTreeVisibleRow<T>) {
  onRowClick(row.node)

  if (treeProps.expandOnClickNode && !row.isLeaf)
    toggleExpand(row.node)
}

function onRowContextMenu(evt: MouseEvent, node: GrTreeNode<T>) {
  interactionContext.emitNodeContextMenu(evt, node.data, node)
}

// ————— Клавиатурная навигация по WAI-ARIA tree pattern (только корневой инстанс).

function isRovingItem(key: GrTreeNode<T>['key']): boolean {
  return roving.rovingKey.value === key
}

const resolvedSize = useGrComponentSize(() => props.size, { component: 'GrTree' })

// Переменные ставим и вложенным уровням тоже: `v-bind="props"` доносит до них
// `size`, а значения одинаковые — наследование от корня не нарушается.
const sizeStyle = computed(() => treeSizeVars[resolvedSize.value])

/**
 * Виртуализация: в DOM живёт только окно вокруг вьюпорта.
 *
 * Корень дерева и есть скроллер — обёрток-распорок между `role="tree"` и
 * `role="treeitem"` быть не должно, поэтому срезанное сверху и снизу держат
 * отступы самого корня.
 */
const TREE_ROW_GAP = 2

const rowEstimate = computed(() => Number.parseFloat(sizeStyle.value['--gr-tree-row-min-height']))

const virtualMaxHeight = computed(() => {
  const value = treeProps.maxHeight
  if (value == null) return undefined
  return typeof value === 'number' ? `${value}px` : value
})

const virtualizer = useVirtualList({
  container: treeRootEl,
  count: () => (treeProps.virtual ? visibleRows.value.length : 0),
  // Раскрытие/фильтр сдвигают индексы строк — замеры прошлого набора невалидны.
  source: () => visibleRows.value,
  itemSize: () => rowEstimate.value,
  gap: TREE_ROW_GAP,
  // Первый рендер обязан совпасть с серверным: контейнера ещё нет, и окно
  // считается от объявленной высоты, а не от измеренной.
  viewportSize: () => (typeof treeProps.maxHeight === 'number' ? treeProps.maxHeight : undefined),
})

/** Строки к отрисовке: при выключенной виртуализации — все. */
const renderedRows = computed(() => {
  if (!treeProps.virtual) return visibleRows.value

  const { start, end } = virtualizer.range.value
  return visibleRows.value.slice(start, end)
})

/**
 * Срезанное сверху и снизу держат псевдоэлементы контейнера.
 *
 * Ни один из трёх напрашивающихся вариантов не годится:
 *
 *  - `padding` контейнера — `max-height` меряет ту же коробку, и распорка в сто
 *    тысяч пикселей либо раздувает скроллер до той же сотни тысяч, либо съедает
 *    всю его высоту;
 *  - обёртка-распорка внутри — между `role="tree"` и `role="treeitem"` не должно
 *    быть посторонних узлов, роль потеряла бы обязательных потомков;
 *  - отступы крайних отрисованных строк — распорка исчезает ровно в тот момент,
 *    когда строки заменяются целиком (прыжок прокрутки), содержимое схлопывается
 *    до высоты окна, и браузер обрезает `scrollTop` до почти нуля.
 *
 * `::before`/`::after` не узлы DOM: их не за что размонтировать, в дереве
 * доступности их нет, а высота приезжает переменными в том же патче, что и сами
 * строки, — схлопнуться между кадрами нечему.
 */
const rootStyle = computed(() => {
  if (!treeProps.virtual) return sizeStyle.value

  return {
    ...sizeStyle.value,
    overflow: 'auto',
    maxHeight: virtualMaxHeight.value,
    ...virtualizer.spacerStyle.value,
  }
})

/** Абсолютный индекс отрисованной строки: поиск по массиву стоил бы O(n) на строку. */
function absoluteIndex(offsetInWindow: number): number {
  return treeProps.virtual ? virtualizer.range.value.start + offsetInWindow : offsetInWindow
}

/**
 * Строка размонтируется: снимаем регистрацию и, если фокус был на ней, уводим
 * его на корень — делегированный keydown живёт там, первая же стрелка вернёт
 * видимую строку через `focusRow`. Иначе фокус упал бы на `body` и клавиатура
 * дерева умерла бы до клика мышью.
 *
 * Спрашиваем сам элемент, а не `document.activeElement === body`: Vue обнуляет
 * function ref ДО удаления узла, поэтому в момент вызова фокус ещё на строке —
 * а «фокус на body» означает лишь то, что страницу никто не трогал.
 */
let isUnmounting = false

function releaseNodeEl(key: GrTreeKey): void {
  const el = interactionContext.nodeEls.get(key)
  const active = typeof document === 'undefined' ? null : document.activeElement
  const heldFocus = Boolean(el && active && (el === active || el.contains(active)))

  interactionContext.registerNodeEl(key, null)

  if (heldFocus && !isUnmounting)
    treeRootEl.value?.focus({ preventScroll: true })
}

/**
 * При виртуализации узла вне окна в DOM нет: `nodeEls.get` вернул бы
 * `undefined`, а фокус уехал бы на `body` вместе с размонтированной строкой.
 * Поэтому сперва прокрутка, и только следующим тиком — фокус.
 */
function scrollRowIntoView(key: GrTreeNode<T>['key']): Promise<void> {
  if (treeProps.virtual) {
    const index = visibleRows.value.findIndex(row => row.node.key === key)
    if (index >= 0) virtualizer.scrollToIndex(index)
  }

  return nextTick()
}

function focusRow(key: GrTreeNode<T>['key']): void {
  void roving.focusKey(key)
}

/**
 * Typeahead паттерна tree: печатные символы копятся в буфер и переводят фокус
 * на первый подходящий видимый узел, начиная со следующего за текущим.
 */
const TYPEAHEAD_RESET_MS = 600
let typeaheadBuffer = ''
let typeaheadTimer: ReturnType<typeof setTimeout> | undefined

function onTypeahead(char: string, rows: GrTreeVisibleRow<T>[], fromIndex: number): void {
  clearTimeout(typeaheadTimer)
  typeaheadTimer = setTimeout(() => { typeaheadBuffer = '' }, TYPEAHEAD_RESET_MS)

  // Повтор одной буквы — это «следующий на ту же букву», а не поиск «аа».
  const repeat = typeaheadBuffer.length === 1 && typeaheadBuffer === char
  typeaheadBuffer = repeat ? char : typeaheadBuffer + char

  const query = typeaheadBuffer.toLowerCase()
  const total = rows.length

  for (let step = 1; step <= total; step += 1) {
    const row = rows[(fromIndex + step) % total]
    if (row.node.label.toLowerCase().startsWith(query)) {
      focusRow(row.node.key)
      return
    }
  }
}

/** `*` — раскрыть всех соседей узла, на котором фокус (уровень целиком). */
function expandSiblings(node: GrTreeNode<T>): void {
  const siblings = node.parent ? node.parent.childNodes : treeStore.treeModel.value.roots

  for (const sibling of siblings) {
    if (sibling.childNodes.length === 0 || treeStore.isExpandedKey(sibling.key))
      continue

    treeStore.setExpandedKey(sibling.key, true)
    interactionContext.emitNodeExpand(sibling.data, sibling)
  }
}

function onTreeKeydown(event: KeyboardEvent): void {
  // Делегированная клавиатура уважает интерактивные цели: печать в инпуте слота
  // узла — ввод текста, а не typeahead. Без гарда preventDefault отменял бы это.
  const target = event.target as HTMLElement | null
  const interactive = target?.closest<HTMLElement>('button, a[href], input, select, textarea, [contenteditable]')
  if (interactive && interactive !== event.currentTarget) {
    // Табируемая цель — самостоятельный таб-стоп: клавиатура целиком её.
    if (interactive.tabIndex >= 0)
      return

    // Кнопки строки (toggle, drag-handle) не табируемы: фокус попадает на них
    // только мышью. За ними остаётся активация — Enter на toggle это его клик, —
    // а навигация принадлежит дереву, иначе клик мышью убивал бы стрелки.
    if (event.key === 'Enter' || event.key === ' ')
      return
  }

  const rows = visibleRows.value
  if (rows.length === 0)
    return

  const idx = Math.max(0, rows.findIndex(r => r.node.key === roving.rovingKey.value))
  const cur = rows[idx]

  if (event.key === '*') {
    event.preventDefault()
    expandSiblings(cur.node)
    return
  }

  // Печатный символ без модификаторов — typeahead, а не команда.
  if (event.key.length === 1 && event.key !== ' ' && !event.ctrlKey && !event.metaKey && !event.altKey) {
    event.preventDefault()
    onTypeahead(event.key, rows, idx)
    return
  }

  // `Shift` со стрелкой двигает сам узел — раскладка аутлайнера. Проверяется
  // раньше навигации: иначе примитив увёл бы фокус вместо переноса.
  if (event.shiftKey && MOVE_KEYS.has(event.key)) {
    if (!treeProps.draggable) return

    event.preventDefault()
    void onNodeMoveKey(cur.node, event.key)
    return
  }

  // Вертикаль, `Home` и `End` ведёт примитив. Влево-вправо он не трогает: в
  // дереве это раскрытие ветки и переход к родителю, а не движение по списку.
  if (roving.handleNavigationKeys(event))
    return

  switch (event.key) {
    case 'ArrowRight':
      event.preventDefault()
      if (!cur.isLeaf) {
        if (!cur.isExpanded)
          toggleExpand(cur.node)
        else if (idx < rows.length - 1)
          focusRow(rows[idx + 1].node.key)
      }
      break
    case 'ArrowLeft':
      event.preventDefault()
      if (!cur.isLeaf && cur.isExpanded)
        toggleExpand(cur.node)
      else if (cur.node.parent && rows.some(r => r.node.key === cur.node.parent!.key))
        focusRow(cur.node.parent.key)
      break
    case 'Enter':
      event.preventDefault()
      onRowClick(cur.node)
      break
    // Space при чекбоксах переключает отметку — это и есть выбор в
    // multi-select дереве; без них он остаётся вторым способом выбрать узел.
    case ' ':
      event.preventDefault()
      if (treeProps.showCheckbox)
        toggleChecked(cur.node)
      else
        onRowClick(cur.node)
      break
  }
}

function onRowMouseEnter(node: GrTreeNode<T>) {
  hoveredKey.value = node.key
}

function onRowMouseLeave(node: GrTreeNode<T>) {
  if (hoveredKey.value === node.key)
    hoveredKey.value = undefined
}

function collapseSiblings(node: GrTreeNode<T>) {
  const siblings = node.parent ? node.parent.childNodes : treeStore.treeModel.value.roots

  for (const sibling of siblings) {
    if (sibling.key === node.key || !treeStore.isExpandedKey(sibling.key))
      continue

    treeStore.setExpandedKey(sibling.key, false)
    interactionContext.emitNodeCollapse(sibling.data, sibling)
  }
}

function toggleExpand(node: GrTreeNode<T>) {
  const expanded = !treeStore.isExpandedKey(node.key)

  if (expanded && treeProps.accordion)
    collapseSiblings(node)

  // Ленивая ветка грузится по первому раскрытию; повторное ничего не запрашивает.
  if (expanded)
    treeStore.ensureLoaded(node)

  treeStore.toggleExpand(node)

  if (expanded)
    interactionContext.emitNodeExpand(node.data, node)
  else
    interactionContext.emitNodeCollapse(node.data, node)
}

// ————— Отметки (чекбоксы).

function checkStateOf(key: GrTreeKey): GrTreeCheckState {
  return treeStore.getCheckState(key)
}

function ariaCheckedOf(row: GrTreeVisibleRow<T>): 'true' | 'false' | 'mixed' | undefined {
  if (!treeProps.showCheckbox)
    return undefined

  const state = checkStateOf(row.node.key)
  return state === 'checked' ? 'true' : state === 'half' ? 'mixed' : 'false'
}

function emitCheck(node: GrTreeNode<T>): void {
  const checkedKeys = treeStore.getCheckedKeys()
  emit('update:checkedKeys', checkedKeys)
  emit('check', node.data, node, { checkedKeys, halfCheckedKeys: treeStore.getHalfCheckedKeys() })
}

function toggleChecked(node: GrTreeNode<T>): void {
  if (!treeProps.showCheckbox)
    return

  const changed = treeStore.toggleChecked(node)
  if (changed)
    emitCheck(changed)
}

// ————— Геометрия строки: отступ уровня и направляющие ветвей.

function rowStyle(row: GrTreeVisibleRow<T>) {
  const step = treeProps.indent && treeProps.indent > 0
    ? `${treeProps.indent}px`
    : 'var(--gr-tree-indent-step)'

  return { '--gr-tree-row-indent': `calc(${step} * ${row.node.level - 1})` }
}

/**
 * Направляющая уровня-предка. Считается от того же шага отступа, что и сам
 * отступ строки, — иначе линия и содержимое разъедутся на вложенных уровнях.
 */
function branchGuideStyle(row: GrTreeVisibleRow<T>, index: number) {
  const step = treeProps.indent && treeProps.indent > 0
    ? `${treeProps.indent}px`
    : 'var(--gr-tree-indent-step)'

  return {
    'left': `calc(${step} * ${index} + var(--gr-tree-branch-line-offset))`,
    '--gr-tree-branch-line-color': row.branchColors[index],
  }
}

// Drag & drop
function canDrag(node: GrTreeNode<T>): boolean {
  return interactionContext.canDrag(node)
}

function shouldShowDragHandle(node: GrTreeNode<T>): boolean {
  return canDrag(node) && hoveredKey.value === node.key
}

/**
 * Треть строки сверху — «до», треть снизу — «после», середина — «внутрь».
 * Зоны нарезает компонент: примитив отдаёт только долю вдоль строки.
 */
function dropTypeFromFraction(fraction: number): GrTreeNodeDropType {
  if (fraction < 1 / 3) return 'prev'
  if (fraction > 2 / 3) return 'next'

  return 'inner'
}

function canDrop(drag: GrTreeNode<T>, target: GrTreeNode<T>, type: GrTreeAllowDropType): boolean {
  return interactionContext.canDrop(drag, target, type)
}

/** Перенос состоялся: одна дорога и для указателя, и для клавиатуры. */
function applyMove(source: GrTreeNode<T>, targetKey: GrTreeKey, type: GrTreeNodeDropType): boolean {
  const reference = treeStore.getNode(targetKey)
  if (!reference) return false

  const movedNode = treeStore.moveNode(source, reference, type)
  if (!movedNode) return false

  const dropNode = treeStore.getNode(reference.key) ?? reference
  interactionContext.emitNodeDrop(movedNode, dropNode, type)

  return true
}

const dragSort = useDragSort<GrTreeKey, GrTreeDropTarget>({
  items: () => visibleRows.value.map(row => row.node.key),
  elementFor: key => interactionContext.nodeEls.get(key) ?? null,
  scroller: () => treeRootEl.value,
  disabled: () => !treeProps.draggable,
  canDrag: (key) => {
    const node = treeStore.getNode(key)

    return node ? canDrag(node) : false
  },
  resolveTarget: (hit, sourceKey, previous) => {
    const source = treeStore.getNode(sourceKey)
    const node = treeStore.getNode(hit.key)
    if (!source || !node) return null

    const type = dropTypeFromFraction(hit.fraction)
    const allowed = treeStore.canMoveNode(source, node, type) && canDrop(source, node, type)

    // Та же ссылка, пока смысл не изменился: иначе подсветка перерисовывалась бы
    // на каждом движении указателя.
    if (previous && previous.key === node.key && previous.type === type && previous.allowed === allowed)
      return previous

    return { key: node.key, type, allowed }
  },
  onDrop: (sourceKey, target) => {
    const source = treeStore.getNode(sourceKey)
    if (!source || !target.allowed) return

    applyMove(source, target.key, target.type)
  },
  onUpdate: (sourceKey, target) => {
    interactionContext.draggingNode.value = sourceKey === null ? null : treeStore.getNode(sourceKey) ?? null
    interactionContext.dropTarget.value = target
  },
})

function onHandlePointerDown(event: PointerEvent, node: GrTreeNode<T>): void {
  if (!treeProps.draggable) return

  dragSort.startFrom(node.key)(event)
}

/**
 * Клавиатурный перенос — раскладка аутлайнера: `Shift` со стрелкой сразу
 * двигает узел, без режима «взято». Режим здесь был бы лишним: `Space` в дереве
 * уже отмечает чекбокс, а стрелки водят фокус по веткам.
 */
function moveByKeyboard(node: GrTreeNode<T>, key: string): boolean {
  const siblings = node.parent ? node.parent.childNodes : treeStore.treeModel.value.roots
  const index = siblings.findIndex(sibling => sibling.key === node.key)

  if (key === 'ArrowUp' && index > 0)
    return applyMove(node, siblings[index - 1].key, 'prev')

  if (key === 'ArrowDown' && index >= 0 && index < siblings.length - 1)
    return applyMove(node, siblings[index + 1].key, 'next')

  // Вправо — в предыдущего соседа: у первого в уровне такого соседа нет.
  if (key === 'ArrowRight' && index > 0)
    return applyMove(node, siblings[index - 1].key, 'inner')

  if (key === 'ArrowLeft' && node.parent)
    return applyMove(node, node.parent.key, 'next')

  return false
}

async function onNodeMoveKey(node: GrTreeNode<T>, key: string): Promise<void> {
  if (!treeProps.draggable || !canDrag(node)) return
  if (!moveByKeyboard(node, key)) return

  announce(t('gr.tree.moved', 'Moved {label}', { label: node.label }))

  // Перестановка перерисовывает уровень: без возврата фокуса следующий Shift
  // уже некуда было бы адресовать.
  await nextTick()
  focusRow(node.key)
}

function filter(value: string) {
  treeStore.filter(value)
}

function resolveNodeClass(classValue: GrTreeNodeClass<T> | undefined, row: GrTreeVisibleRow<T>) {
  if (!classValue)
    return undefined

  return typeof classValue === 'function'
    ? classValue(row)
    : classValue
}

function resolveBranchLineColorValue(color: GrTreeBranchLineColor<T> | undefined, node: GrTreeNode<T>) {
  if (!color)
    return undefined

  return typeof color === 'function'
    ? color(node) ?? undefined
    : color
}

function isBranchLineActive(node: GrTreeNode<T>) {
  const selectedKey = currentKey.value

  if (selectedKey == null)
    return false

  if (node.key === selectedKey)
    return true

  return node.childNodes.some(child => child.key === selectedKey && !treeStore.isExpandedKey(child.key))
}

function resolveBranchLineColor(node: GrTreeNode<T>) {
  const defaultColor = resolveBranchLineColorValue(treeProps.branchLineColor, node) ?? DEFAULT_BRANCH_LINE_COLOR

  if (!isBranchLineActive(node))
    return defaultColor

  return resolveBranchLineColorValue(treeProps.branchLineActiveColor, node) ?? defaultColor
}

/**
 * Переводит фокус на узел (по умолчанию — на тот, что держит roving tabindex).
 * Нужен снаружи: `GrTreeSelect` открывает панель и обязан отдать клавиатуру
 * дереву, иначе стрелки из триггера никуда не ведут.
 */
function focus(key?: GrTreeKey): boolean {
  const rows = visibleRows.value
  if (rows.length === 0)
    return false

  const target = key != null && rows.some(row => row.node.key === key)
    ? key
    : roving.rovingKey.value ?? rows[0].node.key

  focusRow(target)
  return true
}

onUnmounted(() => clearTimeout(typeaheadTimer))
// Дерево уничтожают целиком — строки размонтируются вместе с ним, и возвращать
// фокус на умирающий корень нельзя: он уедет из документа вместе с деревом.
onBeforeUnmount(() => { isUnmounting = true })

defineExpose<GrTreeInstance<T>>({
  appendNode: treeStore.appendNode,
  getCheckedKeys: options => treeStore.getCheckedKeys(options),
  setCheckedKeys: (keys) => {
    treeStore.setCheckedKeys(keys)
    emit('update:checkedKeys', treeStore.getCheckedKeys())
  },
  getHalfCheckedKeys: treeStore.getHalfCheckedKeys,
  setChecked: (node, checked) => {
    const changed = treeStore.setChecked(node, checked)
    if (changed)
      emitCheck(changed)
    return Boolean(changed)
  },
  filter,
  focus,
  getCurrentNode: treeStore.getCurrentNode,
  setCurrentKey: treeStore.setCurrentKey,
  getCurrentKey: treeStore.getCurrentKey,
  getNode: treeStore.getNode,
  insertNodeAfter: treeStore.insertNodeAfter,
  insertNodeBefore: treeStore.insertNodeBefore,
  removeNode: treeStore.removeNode,
  setCurrentNode: treeStore.setCurrentNode,
})
</script>

<template>
  <div
      ref="treeRootEl"
      data-gr-tree
      class="gr-tree"
      tabindex="-1"
      :data-gr-virtual="treeProps.virtual ? '' : undefined"
      role="tree"
      :aria-multiselectable="treeProps.showCheckbox ? 'true' : undefined"
      :style="rootStyle"
      @keydown="onTreeKeydown"
  >
    <div
        v-for="(row, windowIndex) in renderedRows"
        :key="row.node.key"
        :ref="(el) => {
          if (el) interactionContext.registerNodeEl(row.node.key, el as HTMLElement)
          else releaseNodeEl(row.node.key)
          if (treeProps.virtual) virtualizer.measure(absoluteIndex(windowIndex), el as Element | null)
        }"
        data-gr-tree-node
        :data-gr-tree-node-key="row.node.key"
        role="treeitem"
        :aria-level="row.node.level"
        :aria-posinset="row.posInSet"
        :aria-setsize="row.setSize"
        :aria-expanded="row.isLeaf ? undefined : row.isExpanded"
        :aria-selected="currentKey === row.node.key ? 'true' : undefined"
        :aria-checked="ariaCheckedOf(row)"
        :aria-busy="row.isLoading ? 'true' : undefined"
        :tabindex="isRovingItem(row.node.key) ? 0 : -1"
    >
      <div
          data-gr-tree-row
          class="gr-tree__row"
          :class="[
          treeProps.highlightCurrent && currentKey === row.node.key ? 'gr-tree__row--current' : '',
          row.isMatched ? 'gr-tree__row--matched' : '',
          dropTarget?.key === row.node.key && dropTarget.allowed && dropTarget.type === 'inner' ? 'gr-tree__row--drop-inner' : '',
          dropTarget?.key === row.node.key && dropTarget.allowed && dropTarget.type === 'prev' ? 'gr-tree__row--drop-prev' : '',
          dropTarget?.key === row.node.key && dropTarget.allowed && dropTarget.type === 'next' ? 'gr-tree__row--drop-next' : '',
          resolveNodeClass(treeProps.rowClass, row),
        ]"
          :style="rowStyle(row)"
          @click="onRowActivate(row)"
          @contextmenu="onRowContextMenu($event, row.node)"
          @drop.prevent
          @mouseenter="onRowMouseEnter(row.node)"
          @mouseleave="onRowMouseLeave(row.node)"
      >
        <!--
          Направляющие ветвей: по одной на каждый уровень предка. Вложенной
          обёртки с `border-left` больше нет, поэтому линию рисует сама строка —
          и заходит в зазор между строками, иначе она распалась бы на штрихи.
        -->
        <span
            v-for="(color, guideIndex) in row.branchColors"
            :key="guideIndex"
            data-gr-tree-branch-guide
            class="gr-tree__branch-guide"
            :style="branchGuideStyle(row, guideIndex)"
            aria-hidden="true"
        />

        <button
            v-if="treeProps.draggable"
            type="button"
            tabindex="-1"
            data-gr-tree-drag-handle
            class="gr-tree__drag-handle"
            :class="[
            shouldShowDragHandle(row.node) ? 'gr-tree__drag-handle--visible' : '',
            canDrag(row.node) ? '' : 'gr-tree__drag-handle--disabled',
            resolveNodeClass(treeProps.dragHandleClass, row),
          ]"
            :aria-label="dragLabel"
            :aria-disabled="canDrag(row.node) ? undefined : 'true'"
            @click.stop
            @pointerdown="onHandlePointerDown($event, row.node)"
        >
          <span class="gr-tree__drag-icon" :class="treeProps.dragHandleIcon" />
        </button>

        <!-- tabindex="-1": внутри roving-композита интерактив не табируется,
             клавиатурный эквивалент — ArrowRight/ArrowLeft на строке. -->
        <button
            v-if="!row.isLeaf"
            data-gr-tree-toggle
            type="button"
            tabindex="-1"
            class="gr-tree__toggle"
            :class="resolveNodeClass(treeProps.toggleClass, row)"
            :aria-label="row.isExpanded ? collapseLabel : expandLabel"
            @click.stop="toggleExpand(row.node)"
        >
          <span
              v-if="row.isLoading"
              data-gr-tree-loading
              class="gr-tree__toggle-icon animate-spin i-lucide-loader-circle"
          />
          <span
              v-else
              class="gr-tree__toggle-icon"
              :class="[
              row.isExpanded ? treeProps.collapseIcon : treeProps.expandIcon,
              row.isExpanded && treeProps.toggleIconRotate ? 'gr-tree__toggle-icon--expanded' : '',
              resolveNodeClass(treeProps.toggleIconClass, row),
            ]"
          />
        </button>
        <span
            v-else
            class="gr-tree__toggle-spacer"
            :class="resolveNodeClass(treeProps.toggleSpacerClass, row)"
        />

        <!--
          Квадратик отметки декоративен: состояние живёт на самом `treeitem`
          (`aria-checked`), а вложить интерактивный чекбокс внутрь роли-виджета
          нельзя — роль объявляет потомков презентационными.
        -->
        <span
            v-if="treeProps.showCheckbox"
            data-gr-tree-checkbox
            class="gr-tree__checkbox"
            :class="[
            checkStateOf(row.node.key) === 'checked' ? 'gr-tree__checkbox--checked' : '',
            checkStateOf(row.node.key) === 'half' ? 'gr-tree__checkbox--half' : '',
          ]"
            aria-hidden="true"
            @click.stop="toggleChecked(row.node)"
        >
          <span
              v-if="checkStateOf(row.node.key) !== 'unchecked'"
              class="gr-tree__checkbox-mark"
              :class="checkStateOf(row.node.key) === 'half' ? 'i-lucide-minus' : 'i-lucide-check'"
          />
        </span>

        <div class="gr-tree__content" :class="resolveNodeClass(treeProps.contentClass, row)">
          <slot
              :node="row.node"
              :data="row.node.data"
          >
            <span class="gr-tree__label">{{ row.node.label }}</span>
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.gr-tree {
    --gr-tree-gap: 2px;
    --gr-tree-children-pl: 10px;
    --gr-tree-row-min-height: 28px;
    --gr-tree-row-radius: 8px;
    --gr-tree-row-px: 8px;
    --gr-tree-row-py: 8px;
    --gr-tree-row-pr: var(--gr-tree-row-px);
    --gr-tree-font-size: inherit;
    --gr-tree-row-color: var(--gr-fg);
    --gr-tree-row-hover-bg: color-mix(in srgb, var(--gr-primary) 10%, transparent);
    --gr-tree-row-current-bg: color-mix(in srgb, var(--gr-primary) 5%, transparent);
    --gr-tree-row-current-hover-bg: color-mix(in srgb, var(--gr-primary) 16%, transparent);
    --gr-tree-drag-handle-size: 24px;
    --gr-tree-drag-handle-mr: 0;
    --gr-tree-drag-handle-radius: 6px;
    --gr-tree-drag-handle-color: inherit;
    --gr-tree-drag-handle-opacity: 0.55;
    --gr-tree-drag-handle-hover-bg: color-mix(in srgb, var(--gr-muted) 22%, transparent);
    --gr-tree-drag-handle-hover-color: var(--gr-tree-drag-handle-color);
    --gr-tree-drag-handle-hover-opacity: 0.9;
    --gr-tree-drag-handle-disabled-opacity: 0.25;
    --gr-tree-toggle-size: 24px;
    --gr-tree-toggle-mr: 0;
    --gr-tree-toggle-radius: 6px;
    --gr-tree-toggle-color: inherit;
    --gr-tree-toggle-hover-bg: color-mix(in srgb, var(--gr-muted) 25%, transparent);
    --gr-tree-toggle-hover-color: var(--gr-tree-toggle-color);
    --gr-tree-icon-size: 16px;
    --gr-tree-content-gap: 8px;
    --gr-tree-branch-line-default-color: var(--gr-tree-row-current-bg);
    --gr-tree-branch-line-width: 2px;
    /* Шаг отступа уровня: переключатель, отступ вложенного списка и толщина
       направляющей — линия обязана попадать между ними. */
    --gr-tree-indent-step: calc(24px + var(--gr-tree-children-pl) + var(--gr-tree-branch-line-width));
    --gr-tree-branch-line-offset: 24px;
    --gr-tree-checkbox-size: 16px;
    --gr-tree-checkbox-radius: 4px;
    --gr-tree-checkbox-brd: var(--gr-brd);
    --gr-tree-checkbox-bg: transparent;
    --gr-tree-checkbox-checked-bg: var(--gr-primary);
    --gr-tree-checkbox-checked-fg: var(--gr-primary-fg);
    --gr-tree-checkbox-mr: 4px;
    display: flex;
    flex-direction: column;
    gap: var(--gr-tree-gap);
}

[data-gr-virtual]::before,
[data-gr-virtual]::after {
    content: '';
    display: block;
    flex: none;
}

[data-gr-virtual]::before {
    height: var(--gr-virtual-before, 0px);
}

[data-gr-virtual]::after {
    height: var(--gr-virtual-after, 0px);
}

.gr-tree__row {
    position: relative;
    display: flex;
    align-items: center;
    min-height: var(--gr-tree-row-min-height);
    padding: var(--gr-tree-row-py) var(--gr-tree-row-pr) var(--gr-tree-row-py)
        calc(var(--gr-tree-row-px) + var(--gr-tree-row-indent, 0px));
    font-size: var(--gr-tree-font-size);
    cursor: default;
    user-select: none;
    outline: none;
    color: var(--gr-tree-row-color);
}

/* Поверхность строки — отдельный слой, вставленный слева на отступ уровня.
   Фон на самой коробке шёл от левого края дерева и накрывал направляющие
   предков: линия ветки исчезала под подсветкой ровно там, где она и нужна.
   Слой лежит ниже направляющих (они — следующие элементы строки), поэтому
   линия остаётся видна при любом наложении. */
.gr-tree__row::before {
    content: '';
    position: absolute;
    inset: 0 0 0 var(--gr-tree-row-indent, 0px);
    border-radius: var(--gr-tree-row-radius);
    pointer-events: none;
}

.gr-tree__row:hover::before {
    background: var(--gr-tree-row-hover-bg);
}

/* Направляющая тянется в зазор между строками: иначе линия ветки распалась бы
   на штрихи по числу строк. */
.gr-tree__branch-guide {
    position: absolute;
    top: calc(var(--gr-tree-gap) / -2);
    bottom: calc(var(--gr-tree-gap) / -2);
    width: var(--gr-tree-branch-line-width);
    background: var(--gr-tree-branch-line-color, var(--gr-tree-branch-line-default-color));
    pointer-events: none;
}

.gr-tree__checkbox {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: var(--gr-tree-checkbox-size);
    height: var(--gr-tree-checkbox-size);
    margin-right: var(--gr-tree-checkbox-mr);
    border: 1px solid var(--gr-tree-checkbox-brd);
    border-radius: var(--gr-tree-checkbox-radius);
    background: var(--gr-tree-checkbox-bg);
    color: var(--gr-tree-checkbox-checked-fg);
    cursor: pointer;
}

.gr-tree__checkbox--checked,
.gr-tree__checkbox--half {
    border-color: var(--gr-tree-checkbox-checked-bg);
    background: var(--gr-tree-checkbox-checked-bg);
}

.gr-tree__checkbox-mark {
    width: calc(var(--gr-tree-checkbox-size) - 4px);
    height: calc(var(--gr-tree-checkbox-size) - 4px);
}


[data-gr-tree-node] {
    outline: none;
}

/* Кольцо фокуса — на той же поверхности, что подсветка: иначе строка читалась бы
   двумя разными прямоугольниками. `outline` для этого не годится — он рисуется по
   границе коробки, а не по инсету. */
[data-gr-tree-node]:focus-visible > .gr-tree__row::before {
    box-shadow: inset 0 0 0 2px var(--gr-primary);
}

.gr-tree__row--current::before {
    background: var(--gr-tree-row-current-bg);
}

.gr-tree__row--current:hover::before {
    background: var(--gr-tree-row-current-hover-bg);
}

.gr-tree__row--matched .gr-tree__label {
    font-weight: 600;
}

.gr-tree__drag-handle {
    width: var(--gr-tree-drag-handle-size);
    height: var(--gr-tree-drag-handle-size);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-right: var(--gr-tree-drag-handle-mr);
    border-radius: var(--gr-tree-drag-handle-radius);
    color: var(--gr-tree-drag-handle-color);
    cursor: grab;
    /* Без этого вертикальный свайп по ручке уходит в прокрутку страницы,
       браузер отзывает указатель, и пальцем узел неперетаскиваем. */
    touch-action: none;
    visibility: hidden;
    pointer-events: none;
    opacity: 0;
}

.gr-tree__drag-handle--visible {
    visibility: visible;
    pointer-events: auto;
    opacity: var(--gr-tree-drag-handle-opacity);
}

.gr-tree__drag-handle:hover {
    background: var(--gr-tree-drag-handle-hover-bg);
    color: var(--gr-tree-drag-handle-hover-color);
    opacity: var(--gr-tree-drag-handle-hover-opacity);
}

.gr-tree__drag-handle:active {
    cursor: grabbing;
}

.gr-tree__drag-handle--disabled {
    cursor: default;
    opacity: var(--gr-tree-drag-handle-disabled-opacity);
}

.gr-tree__drag-icon {
    width: var(--gr-tree-icon-size);
    height: var(--gr-tree-icon-size);
}

.gr-tree__toggle {
    width: var(--gr-tree-toggle-size);
    height: var(--gr-tree-toggle-size);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-right: var(--gr-tree-toggle-mr);
    border-radius: var(--gr-tree-toggle-radius);
    color: var(--gr-tree-toggle-color);
}

.gr-tree__toggle:hover {
    background: var(--gr-tree-toggle-hover-bg);
    color: var(--gr-tree-toggle-hover-color);
}

.gr-tree__toggle-icon {
    width: var(--gr-tree-icon-size);
    height: var(--gr-tree-icon-size);
    transition: transform var(--gr-duration-fast) var(--gr-ease-out);
}

.gr-tree__toggle-icon--expanded {
    transform: rotate(90deg);
}

.gr-tree__toggle-spacer {
    width: var(--gr-tree-toggle-size);
    height: var(--gr-tree-toggle-size);
    margin-right: var(--gr-tree-toggle-mr);
    display: inline-block;
}

.gr-tree__content {
    min-width: 0;
    display: flex;
    align-items: center;
    gap: var(--gr-tree-content-gap);
}

.gr-tree__label {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.gr-tree__row--drop-inner {
    outline: 2px solid color-mix(in srgb, var(--gr-primary) 40%, transparent);
}

.gr-tree__row--drop-prev::before,
.gr-tree__row--drop-next::after {
    content: '';
    position: absolute;
    left: 8px;
    right: 8px;
    height: 2px;
    background: color-mix(in srgb, var(--gr-primary) 55%, transparent);
}

.gr-tree__row--drop-prev::before {
    top: 2px;
}

.gr-tree__row--drop-next::after {
    bottom: 2px;
}
</style>
