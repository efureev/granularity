<script setup lang="ts" generic="T extends Record<string, any> = any">
import { computed } from 'vue'
import type {
  GrTreeAllowDropType,
  GrTreeInstance,
  GrTreeNode,
  GrTreeNodeDropType,
} from './grTreeTypes'
import { createGrTreeDataAdapter } from './grTreeDataAdapter'
import { createGrTreeInteractionContext } from './grTreeInteractionContext'
import { createGrTreeStore } from './grTreeStore'
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

const DEFAULT_BRANCH_LINE_COLOR = 'var(--ds-tree-branch-line-default-color, #e2e8f0)'

const props = withDefaults(defineProps<GrTreeProps<T>>(), {
  props: () => ({
    children: 'children',
    label: 'label',
  }),
  nodeKey: 'id' as any,
  defaultExpandedKeys: () => [],
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
  dragLabel: 'Drag',
  expandLabel: 'Expand',
  collapseLabel: 'Collapse',
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
}>()

defineSlots<{
  default?: (props: { node: GrTreeNode<T>; data: T }) => any
}>()

const dataAdapter = createGrTreeDataAdapter(props)
const treeStore = props.internalStore ?? createGrTreeStore({
  adapter: dataAdapter,
  data: () => props.data,
  defaultExpandedKeys: () => props.defaultExpandedKeys,
  filterNodeMethod: () => props.filterNodeMethod,
})
const interactionContext = props.internalInteractionContext ?? createGrTreeInteractionContext(props, {
  emitNodeClick: (data, node) => emit('nodeClick', data, node),
  emitNodeExpand: (data, node) => emit('nodeExpand', data, node),
  emitNodeCollapse: (data, node) => emit('nodeCollapse', data, node),
  emitNodeDrop: (draggingNode, dropNode, dropType) => emit('nodeDrop', draggingNode, dropNode, dropType),
})

const treeProps = props as Readonly<GrTreeProps<T>>
const currentKey = treeStore.currentKey
const hoveredKey = interactionContext.hoveredKey
const dropTarget = interactionContext.dropTarget

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
  interactionContext.emitNodeClick(node.data, node)
}

function onRowMouseEnter(node: GrTreeNode<T>) {
  hoveredKey.value = node.key
}

function onRowMouseLeave(node: GrTreeNode<T>) {
  if (hoveredKey.value === node.key)
    hoveredKey.value = undefined
}

function toggleExpand(node: GrTreeNode<T>) {
  const expanded = !treeStore.isExpandedKey(node.key)
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
  const drag = interactionContext.draggingNode.value
  const target = interactionContext.dropTarget.value
  if (!treeProps.draggable || !drag || !target)
    return

  evt.preventDefault()

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
    '--ds-tree-branch-line-color': resolveBranchLineColor(row.node),
  }
}

defineExpose<GrTreeInstance<T>>({
  appendNode: treeStore.appendNode,
  filter,
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
      :data-ds-tree="props.internalNested ? undefined : ''"
      :class="props.internalNested ? 'ds-tree__children' : 'ds-tree'"
      :role="props.internalNested ? 'group' : 'tree'"
  >
    <div
        v-for="row in visibleRows"
        :key="row.node.key"
        data-ds-tree-node
        role="treeitem"
        :aria-level="row.node.level"
        :aria-expanded="row.isLeaf ? undefined : row.isExpanded"
    >
      <div
          data-ds-tree-row
          class="ds-tree__row py-2 px-2"
          :class="[
          treeProps.highlightCurrent && currentKey === row.node.key ? 'ds-tree__row--current' : '',
          row.isMatched ? 'ds-tree__row--matched' : '',
          dropTarget?.key === row.node.key && dropTarget.allowed && dropTarget.type === 'inner' ? 'ds-tree__row--drop-inner' : '',
          dropTarget?.key === row.node.key && dropTarget.allowed && dropTarget.type === 'prev' ? 'ds-tree__row--drop-prev' : '',
          dropTarget?.key === row.node.key && dropTarget.allowed && dropTarget.type === 'next' ? 'ds-tree__row--drop-next' : '',
          resolveNodeClass(treeProps.rowClass, row),
        ]"
          tabindex="0"
          @click="onRowClick(row.node)"
          @drop="onDrop($event, row.node)"
          @dragover="onDragOver($event, row.node, $event.currentTarget as HTMLElement)"
          @mouseenter="onRowMouseEnter(row.node)"
          @mouseleave="onRowMouseLeave(row.node)"
      >
        <button
            v-if="treeProps.draggable"
            type="button"
            data-ds-tree-drag-handle
            class="ds-tree__drag-handle"
            :class="[
            shouldShowDragHandle(row.node) ? 'ds-tree__drag-handle--visible' : '',
            canDrag(row.node) ? '' : 'ds-tree__drag-handle--disabled',
            resolveNodeClass(treeProps.dragHandleClass, row),
          ]"
            :aria-label="treeProps.dragLabel"
            :draggable="canDrag(row.node)"
            @click.stop
            @mousedown.stop
            @dragstart="onDragStart($event, row.node)"
            @dragend="onDragEnd"
        >
          <span class="ds-tree__drag-icon" :class="treeProps.dragHandleIcon" />
        </button>

        <button
            v-if="!row.isLeaf"
            data-ds-tree-toggle
            type="button"
            class="ds-tree__toggle"
            :class="resolveNodeClass(treeProps.toggleClass, row)"
            :aria-label="row.isExpanded ? treeProps.collapseLabel : treeProps.expandLabel"
            @click.stop="toggleExpand(row.node)"
        >
          <span
              class="ds-tree__toggle-icon"
              :class="[
              row.isExpanded ? treeProps.collapseIcon : treeProps.expandIcon,
              row.isExpanded && treeProps.toggleIconRotate ? 'ds-tree__toggle-icon--expanded' : '',
              resolveNodeClass(treeProps.toggleIconClass, row),
            ]"
          />
        </button>
        <span
            v-else
            class="ds-tree__toggle-spacer"
            :class="resolveNodeClass(treeProps.toggleSpacerClass, row)"
        />

        <div class="ds-tree__content" :class="resolveNodeClass(treeProps.contentClass, row)">
          <slot
              :node="row.node"
              :data="row.node.data"
          >
            <span class="ds-tree__label">{{ row.node.label }}</span>
          </slot>
        </div>
      </div>

      <div
          v-if="row.children.length"
          class="ds-tree__children-wrap ml-6"
          :class="treeProps.branchLine ? 'ds-tree__children-wrap--with-branch' : ''"
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
              <span class="ds-tree__label">{{ slotProps.node.label }}</span>
            </slot>
          </template>
        </GrTree>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ds-tree {
    --ds-tree-gap: 2px;
    --ds-tree-children-pl: 10px;
    --ds-tree-row-min-height: 28px;
    --ds-tree-row-radius: 8px;
    --ds-tree-row-pr: 8px;
    --ds-tree-row-color: var(--fg);
    --ds-tree-row-hover-bg: color-mix(in srgb, var(--primary, #000) 10%, transparent);
    --ds-tree-row-current-bg: color-mix(in srgb, var(--primary, #000) 5%, transparent);
    --ds-tree-row-current-hover-bg: color-mix(in srgb, var(--primary, #000) 16%, transparent);
    --ds-tree-drag-handle-size: 24px;
    --ds-tree-drag-handle-mr: 0;
    --ds-tree-drag-handle-radius: 6px;
    --ds-tree-drag-handle-color: inherit;
    --ds-tree-drag-handle-opacity: 0.55;
    --ds-tree-drag-handle-hover-bg: color-mix(in srgb, var(--muted, #000) 22%, transparent);
    --ds-tree-drag-handle-hover-color: var(--ds-tree-drag-handle-color);
    --ds-tree-drag-handle-hover-opacity: 0.9;
    --ds-tree-drag-handle-disabled-opacity: 0.25;
    --ds-tree-toggle-size: 24px;
    --ds-tree-toggle-mr: 0;
    --ds-tree-toggle-radius: 6px;
    --ds-tree-toggle-color: inherit;
    --ds-tree-toggle-hover-bg: color-mix(in srgb, var(--muted, #000) 25%, transparent);
    --ds-tree-toggle-hover-color: var(--ds-tree-toggle-color);
    --ds-tree-icon-size: 16px;
    --ds-tree-content-gap: 8px;
    --ds-tree-branch-line-default-color: var(--ds-tree-row-current-bg);
    --ds-tree-branch-line-width: 2px;
    display: flex;
    flex-direction: column;
    gap: var(--ds-tree-gap);
}

.ds-tree__children {
    display: flex;
    flex-direction: column;
    gap: var(--ds-tree-gap);
}

.ds-tree__children-wrap {
    --ds-tree-branch-line-color: var(--ds-tree-branch-line-default-color);
    display: flex;
    flex-direction: column;
    gap: var(--ds-tree-gap);
    padding-left: var(--ds-tree-children-pl, 10px);
    border-left: var(--ds-tree-branch-line-width) solid transparent;
}

.ds-tree__children-wrap--with-branch {
    border-left-color: var(--ds-tree-branch-line-color, var(--ds-tree-branch-line-default-color));
}

.ds-tree__row {
    position: relative;
    display: flex;
    align-items: center;
    min-height: var(--ds-tree-row-min-height);
    border-radius: var(--ds-tree-row-radius);
    padding-right: var(--ds-tree-row-pr);
    cursor: default;
    user-select: none;
    outline: none;
    color: var(--ds-tree-row-color);
}

.ds-tree__row:hover {
    background: var(--ds-tree-row-hover-bg);
}

.ds-tree__row--current {
    background: var(--ds-tree-row-current-bg);
}

.ds-tree__row--current:hover {
    background: var(--ds-tree-row-current-hover-bg);
}

.ds-tree__row--matched .ds-tree__label {
    font-weight: 600;
}

.ds-tree__drag-handle {
    width: var(--ds-tree-drag-handle-size);
    height: var(--ds-tree-drag-handle-size);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-right: var(--ds-tree-drag-handle-mr);
    border-radius: var(--ds-tree-drag-handle-radius);
    color: var(--ds-tree-drag-handle-color);
    cursor: grab;
    visibility: hidden;
    pointer-events: none;
    opacity: 0;
}

.ds-tree__drag-handle--visible {
    visibility: visible;
    pointer-events: auto;
    opacity: var(--ds-tree-drag-handle-opacity);
}

.ds-tree__drag-handle:hover {
    background: var(--ds-tree-drag-handle-hover-bg);
    color: var(--ds-tree-drag-handle-hover-color);
    opacity: var(--ds-tree-drag-handle-hover-opacity);
}

.ds-tree__drag-handle:active {
    cursor: grabbing;
}

.ds-tree__drag-handle--disabled {
    cursor: default;
    opacity: var(--ds-tree-drag-handle-disabled-opacity);
}

.ds-tree__drag-icon {
    width: var(--ds-tree-icon-size);
    height: var(--ds-tree-icon-size);
}

.ds-tree__toggle {
    width: var(--ds-tree-toggle-size);
    height: var(--ds-tree-toggle-size);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-right: var(--ds-tree-toggle-mr);
    border-radius: var(--ds-tree-toggle-radius);
    color: var(--ds-tree-toggle-color);
}

.ds-tree__toggle:hover {
    background: var(--ds-tree-toggle-hover-bg);
    color: var(--ds-tree-toggle-hover-color);
}

.ds-tree__toggle-icon {
    width: var(--ds-tree-icon-size);
    height: var(--ds-tree-icon-size);
    transition: transform 120ms ease;
}

.ds-tree__toggle-icon--expanded {
    transform: rotate(90deg);
}

.ds-tree__toggle-spacer {
    width: var(--ds-tree-toggle-size);
    height: var(--ds-tree-toggle-size);
    margin-right: var(--ds-tree-toggle-mr);
    display: inline-block;
}

.ds-tree__content {
    min-width: 0;
    display: flex;
    align-items: center;
    gap: var(--ds-tree-content-gap);
}

.ds-tree__label {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.ds-tree__row--drop-inner {
    outline: 2px solid color-mix(in srgb, var(--primary, #000) 40%, transparent);
}

.ds-tree__row--drop-prev::before,
.ds-tree__row--drop-next::after {
    content: '';
    position: absolute;
    left: 8px;
    right: 8px;
    height: 2px;
    background: color-mix(in srgb, var(--primary, #000) 55%, transparent);
}

.ds-tree__row--drop-prev::before {
    top: 2px;
}

.ds-tree__row--drop-next::after {
    bottom: 2px;
}
</style>
