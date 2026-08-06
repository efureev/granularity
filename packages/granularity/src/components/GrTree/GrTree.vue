<script setup lang="ts" generic="T extends Record<string, any> = any">
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'
import type {
  GrTreeAllowDropType,
  GrTreeInstance,
  GrTreeKey,
  GrTreeNode,
  GrTreeNodeDropType,
} from './grTreeTypes'
import { createGrTreeDataAdapter } from './grTreeDataAdapter'
import { createGrTreeInteractionContext } from './grTreeInteractionContext'
import { createGrTreeStore } from './grTreeStore'
import { treeSizeVars } from './grTreeStyles'
import { useGrComponentSize } from '../GrConfigProvider/context'
import { useGranularityTranslations } from '../../internal/granularityI18n'
import type {
  GrTreeBranchLineColor,
  GrTreeNodeClass,
  GrTreeProps,
  GrTreeVisibleRow,
  GrTreeVisibleTreeRow,
} from './grTreeProps'

defineOptions({
  name: 'GrTree',
})

const DEFAULT_BRANCH_LINE_COLOR = 'var(--gr-tree-branch-line-default-color, var(--gr-brd))'

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
  internalRows: undefined,
  internalNested: false,
  internalStore: undefined,
})

const emit = defineEmits<{
  (event: 'nodeClick', data: T, node: GrTreeNode<T>): void
  (event: 'nodeExpand', data: T, node: GrTreeNode<T>): void
  (event: 'nodeCollapse', data: T, node: GrTreeNode<T>): void
  (event: 'nodeDrop', draggingNode: GrTreeNode<T>, dropNode: GrTreeNode<T>, dropType: GrTreeNodeDropType): void
  (event: 'nodeContextMenu', evt: MouseEvent, data: T, node: GrTreeNode<T>): void
}>()

defineSlots<{
  default?: (props: { node: GrTreeNode<T>; data: T }) => any
}>()

const dataAdapter = createGrTreeDataAdapter(props)
const treeStore = props.internalStore ?? createGrTreeStore({
  adapter: dataAdapter,
  data: () => props.data,
  defaultExpandedKeys: () => props.defaultExpandedKeys,
  defaultExpandAll: () => props.defaultExpandAll,
  filterNodeMethod: () => props.filterNodeMethod,
})
const interactionContext = props.internalInteractionContext ?? createGrTreeInteractionContext(props, {
  emitNodeClick: (data, node) => emit('nodeClick', data, node),
  emitNodeExpand: (data, node) => emit('nodeExpand', data, node),
  emitNodeCollapse: (data, node) => emit('nodeCollapse', data, node),
  emitNodeDrop: (draggingNode, dropNode, dropType) => emit('nodeDrop', draggingNode, dropNode, dropType),
  emitNodeContextMenu: (evt, data, node) => emit('nodeContextMenu', evt, data, node),
})

const treeProps = props as Readonly<GrTreeProps<T>>

const { t } = useGranularityTranslations()
const dragLabel = computed(() => treeProps.dragLabel ?? t('gr.tree.drag', 'Drag'))
const expandLabel = computed(() => treeProps.expandLabel ?? t('gr.tree.expand', 'Expand'))
const collapseLabel = computed(() => treeProps.collapseLabel ?? t('gr.tree.collapse', 'Collapse'))
const currentKey = treeStore.currentKey
const hoveredKey = interactionContext.hoveredKey
const focusedKey = interactionContext.focusedKey
const dropTarget = interactionContext.dropTarget

// Корневой элемент дерева — область для делегированной клавиатуры (WAI-ARIA tree).
const treeRootEl = ref<HTMLElement | null>(null)

const visibleRows = computed<GrTreeVisibleTreeRow<T>[]>(() => {
  if (props.internalRows)
    return props.internalRows

  const { roots } = treeStore.treeModel.value
  const { isActive, subtreeHasMatch, matchedKeys, autoExpandKeys } = treeStore.filterInfo.value

  const walk = (nodes: GrTreeNode<T>[]): GrTreeVisibleTreeRow<T>[] => {
    const rows: GrTreeVisibleTreeRow<T>[] = []

    for (const node of nodes) {
      if (isActive && !subtreeHasMatch.get(node.key))
        continue

      const isLeaf = node.childNodes.length === 0
      const isMatched = matchedKeys.has(node.key)
      const isExpanded = treeStore.isExpandedKey(node.key) || (isActive && autoExpandKeys.has(node.key))

      rows.push({
        node,
        isExpanded,
        isLeaf,
        isMatched,
        children: isExpanded ? walk(node.childNodes) : [],
      })
    }

    return rows
  }

  return walk(roots)
})

function onRowClick(node: GrTreeNode<T>) {
  treeStore.setCurrentKey(node.key)
  focusedKey.value = node.key
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

type FlatRow = { node: GrTreeNode<T>, isLeaf: boolean, isExpanded: boolean }

// Плоский список видимых узлов в порядке отображения (для стрелочной навигации).
const flatVisibleRows = computed<FlatRow[]>(() => {
  const out: FlatRow[] = []
  const walk = (rows: GrTreeVisibleTreeRow<T>[]) => {
    for (const row of rows) {
      out.push({ node: row.node, isLeaf: row.isLeaf, isExpanded: row.isExpanded })
      if (row.children.length)
        walk(row.children)
    }
  }
  walk(visibleRows.value)
  return out
})

// Один узел на всё дерево держит tabindex=0 (roving). `focusedKey` — общий для
// всех вложенных инстансов, поэтому проверка одинаковая на любом уровне.
function isRovingItem(key: GrTreeNode<T>['key']): boolean {
  return focusedKey.value === key
}

function focusRow(key: GrTreeNode<T>['key']): void {
  focusedKey.value = key
  void nextTick(() => interactionContext.nodeEls.get(key)?.focus())
}

/**
 * Typeahead паттерна tree: печатные символы копятся в буфер и переводят фокус
 * на первый подходящий видимый узел, начиная со следующего за текущим.
 */
const TYPEAHEAD_RESET_MS = 600
let typeaheadBuffer = ''
let typeaheadTimer: ReturnType<typeof setTimeout> | undefined

function onTypeahead(char: string, rows: FlatRow[], fromIndex: number): void {
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
  // Обрабатывает только корневой инстанс; событие всплывает от строки к корню.
  if (props.internalNested)
    return

  const rows = flatVisibleRows.value
  if (rows.length === 0)
    return

  const idx = Math.max(0, rows.findIndex(r => r.node.key === focusedKey.value))
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

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      if (idx < rows.length - 1)
        focusRow(rows[idx + 1].node.key)
      break
    case 'ArrowUp':
      event.preventDefault()
      if (idx > 0)
        focusRow(rows[idx - 1].node.key)
      break
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
    case 'Home':
      event.preventDefault()
      focusRow(rows[0].node.key)
      break
    case 'End':
      event.preventDefault()
      focusRow(rows[rows.length - 1].node.key)
      break
    case 'Enter':
    case ' ':
      event.preventDefault()
      onRowClick(cur.node)
      break
  }
}

// Нормализация roving-фокуса: держим `focusedKey` на видимом узле, чтобы ровно
// один treeitem всегда имел tabindex=0 (даже после сворачивания родителя). Только корень.
function normalizeFocusedKey(): void {
  if (props.internalNested)
    return

  const rows = flatVisibleRows.value
  if (rows.length === 0) {
    focusedKey.value = undefined
    return
  }

  const stillVisible = focusedKey.value !== undefined && rows.some(r => r.node.key === focusedKey.value)
  if (stillVisible)
    return

  focusedKey.value = (currentKey.value != null && rows.some(r => r.node.key === currentKey.value))
    ? currentKey.value
    : rows[0].node.key
}

if (!props.internalNested) {
  // Синхронно до первого рендера — чтобы roving tabindex был проставлен сразу.
  normalizeFocusedKey()
  watch(flatVisibleRows, normalizeFocusedKey, { flush: 'sync' })
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

  treeStore.toggleExpand(node)

  if (expanded)
    interactionContext.emitNodeExpand(node.data, node)
  else
    interactionContext.emitNodeCollapse(node.data, node)
}

// Drag & drop
function canDrag(node: GrTreeNode<T>): boolean {
  return interactionContext.canDrag(node)
}

function shouldShowDragHandle(node: GrTreeNode<T>): boolean {
  return canDrag(node) && hoveredKey.value === node.key
}

function resolveDropType(evt: DragEvent, el: HTMLElement): GrTreeNodeDropType {
  const rect = el.getBoundingClientRect()
  const y = evt.clientY - rect.top
  const third = rect.height / 3
  if (y < third)
    return 'prev'
  if (y > third * 2)
    return 'next'
  return 'inner'
}

function canDrop(drag: GrTreeNode<T>, target: GrTreeNode<T>, type: GrTreeAllowDropType): boolean {
  return interactionContext.canDrop(drag, target, type)
}

function onDragStart(evt: DragEvent, node: GrTreeNode<T>) {
  if (!canDrag(node)) {
    evt.preventDefault()
    return
  }

  interactionContext.draggingNode.value = node
  interactionContext.dropTarget.value = null
  try {
    evt.dataTransfer?.setData('text/plain', String(node.key))
  }
  catch {
    // ignore
  }
  if (evt.dataTransfer)
    evt.dataTransfer.effectAllowed = 'move'
}

function onDragEnd() {
  interactionContext.resetDragState()
}

function onDragOver(evt: DragEvent, node: GrTreeNode<T>, rowEl: HTMLElement) {
  const drag = interactionContext.draggingNode.value
  if (!treeProps.draggable || !drag)
    return

  // required for `drop` to fire
  evt.preventDefault()

  const type = resolveDropType(evt, rowEl)
  const allowed = treeStore.canMoveNode(drag, node, type) && canDrop(drag, node, type)
  interactionContext.dropTarget.value = { key: node.key, type, allowed }
  if (evt.dataTransfer)
    evt.dataTransfer.dropEffect = allowed ? 'move' : 'none'
}

function onDrop(evt: DragEvent, node: GrTreeNode<T>) {
  // Первым делом и безусловно: если drop до нас дошёл, дефолт браузера — это
  // навигация по брошенной ссылке или открытие брошенного файла поверх страницы.
  evt.preventDefault()

  const drag = interactionContext.draggingNode.value
  const target = interactionContext.dropTarget.value
  if (!treeProps.draggable || !drag || !target)
    return

  if (target.key === node.key && target.allowed) {
    const movedNode = treeStore.moveNode(drag, node, target.type)
    if (movedNode) {
      const dropNode = treeStore.getNode(node.key) ?? node
      interactionContext.emitNodeDrop(movedNode, dropNode, target.type)
    }
  }

  interactionContext.resetDragState()
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

function resolveChildrenWrapStyle(row: GrTreeVisibleTreeRow<T>) {
  if (!treeProps.branchLine)
    return {
    }

  return {
    '--gr-tree-branch-line-color': resolveBranchLineColor(row.node),
  }
}

const resolvedSize = useGrComponentSize(() => props.size, { component: 'GrTree' })

// Переменные ставим и вложенным уровням тоже: `v-bind="props"` доносит до них
// `size`, а значения одинаковые — наследование от корня не нарушается.
const sizeStyle = computed(() => treeSizeVars[resolvedSize.value])

/**
 * Переводит фокус на узел (по умолчанию — на тот, что держит roving tabindex).
 * Нужен снаружи: `GrTreeSelect` открывает панель и обязан отдать клавиатуру
 * дереву, иначе стрелки из триггера никуда не ведут.
 */
function focus(key?: GrTreeKey): boolean {
  const rows = flatVisibleRows.value
  if (rows.length === 0)
    return false

  const target = key != null && rows.some(row => row.node.key === key)
    ? key
    : focusedKey.value ?? rows[0].node.key

  focusRow(target)
  return true
}

onUnmounted(() => clearTimeout(typeaheadTimer))

defineExpose<GrTreeInstance<T>>({
  appendNode: treeStore.appendNode,
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
      :data-gr-tree="props.internalNested ? undefined : ''"
      :class="props.internalNested ? 'gr-tree__children' : 'gr-tree'"
      :role="props.internalNested ? 'group' : 'tree'"
      :style="sizeStyle"
      @keydown="onTreeKeydown"
  >
    <div
        v-for="row in visibleRows"
        :key="row.node.key"
        :ref="el => interactionContext.registerNodeEl(row.node.key, el as HTMLElement | null)"
        data-gr-tree-node
        :data-gr-tree-node-key="row.node.key"
        role="treeitem"
        :aria-level="row.node.level"
        :aria-expanded="row.isLeaf ? undefined : row.isExpanded"
        :aria-selected="currentKey === row.node.key ? 'true' : undefined"
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
          @click="onRowActivate(row)"
          @contextmenu="onRowContextMenu($event, row.node)"
          @drop="onDrop($event, row.node)"
          @dragover="onDragOver($event, row.node, $event.currentTarget as HTMLElement)"
          @mouseenter="onRowMouseEnter(row.node)"
          @mouseleave="onRowMouseLeave(row.node)"
      >
        <button
            v-if="treeProps.draggable"
            type="button"
            data-gr-tree-drag-handle
            class="gr-tree__drag-handle"
            :class="[
            shouldShowDragHandle(row.node) ? 'gr-tree__drag-handle--visible' : '',
            canDrag(row.node) ? '' : 'gr-tree__drag-handle--disabled',
            resolveNodeClass(treeProps.dragHandleClass, row),
          ]"
            :aria-label="dragLabel"
            :draggable="canDrag(row.node)"
            @click.stop
            @mousedown.stop
            @dragstart="onDragStart($event, row.node)"
            @dragend="onDragEnd"
        >
          <span class="gr-tree__drag-icon" :class="treeProps.dragHandleIcon" />
        </button>

        <button
            v-if="!row.isLeaf"
            data-gr-tree-toggle
            type="button"
            class="gr-tree__toggle"
            :class="resolveNodeClass(treeProps.toggleClass, row)"
            :aria-label="row.isExpanded ? collapseLabel : expandLabel"
            @click.stop="toggleExpand(row.node)"
        >
          <span
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

        <div class="gr-tree__content" :class="resolveNodeClass(treeProps.contentClass, row)">
          <slot
              :node="row.node"
              :data="row.node.data"
          >
            <span class="gr-tree__label">{{ row.node.label }}</span>
          </slot>
        </div>
      </div>

      <div
          v-if="row.children.length"
          class="gr-tree__children-wrap ml-6"
          :class="treeProps.branchLine ? 'gr-tree__children-wrap--with-branch' : ''"
          :style="resolveChildrenWrapStyle(row)"
      >
        <GrTree
            v-bind="props"
            :data="[]"
            :internal-rows="row.children"
            internal-nested
            :internal-store="treeStore"
            :internal-interaction-context="interactionContext"
        >
          <template #default="slotProps">
            <slot v-bind="slotProps">
              <span class="gr-tree__label">{{ slotProps.node.label }}</span>
            </slot>
          </template>
        </GrTree>
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
    display: flex;
    flex-direction: column;
    gap: var(--gr-tree-gap);
}

.gr-tree__children {
    display: flex;
    flex-direction: column;
    gap: var(--gr-tree-gap);
}

.gr-tree__children-wrap {
    --gr-tree-branch-line-color: var(--gr-tree-branch-line-default-color);
    display: flex;
    flex-direction: column;
    gap: var(--gr-tree-gap);
    padding-left: var(--gr-tree-children-pl, 10px);
    border-left: var(--gr-tree-branch-line-width) solid transparent;
}

.gr-tree__children-wrap--with-branch {
    border-left-color: var(--gr-tree-branch-line-color, var(--gr-tree-branch-line-default-color));
}

.gr-tree__row {
    position: relative;
    display: flex;
    align-items: center;
    min-height: var(--gr-tree-row-min-height);
    border-radius: var(--gr-tree-row-radius);
    padding: var(--gr-tree-row-py) var(--gr-tree-row-pr) var(--gr-tree-row-py) var(--gr-tree-row-px);
    font-size: var(--gr-tree-font-size);
    cursor: default;
    user-select: none;
    outline: none;
    color: var(--gr-tree-row-color);
}

.gr-tree__row:hover {
    background: var(--gr-tree-row-hover-bg);
}

[data-gr-tree-node] {
    outline: none;
}

[data-gr-tree-node]:focus-visible > .gr-tree__row {
    outline: 2px solid var(--gr-primary);
    outline-offset: -2px;
}

.gr-tree__row--current {
    background: var(--gr-tree-row-current-bg);
}

.gr-tree__row--current:hover {
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
    transition: transform 120ms ease;
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
