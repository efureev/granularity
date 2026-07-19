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

const DEFAULT_BRANCH_LINE_COLOR = 'var(--gr-tree-branch-line-default-color, #e2e8f0)'

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

const { t } = useGranularityTranslations()
const dragLabel = computed(() => treeProps.dragLabel ?? t('gr.tree.drag', 'Drag'))
const expandLabel = computed(() => treeProps.expandLabel ?? t('gr.tree.expand', 'Expand'))
const collapseLabel = computed(() => treeProps.collapseLabel ?? t('gr.tree.collapse', 'Collapse'))
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
    '--gr-tree-branch-line-color': resolveBranchLineColor(row.node),
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
      :data-gr-tree="props.internalNested ? undefined : ''"
      :class="props.internalNested ? 'gr-tree__children' : 'gr-tree'"
      :role="props.internalNested ? 'group' : 'tree'"
  >
    <div
        v-for="row in visibleRows"
        :key="row.node.key"
        data-gr-tree-node
        role="treeitem"
        :aria-level="row.node.level"
        :aria-expanded="row.isLeaf ? undefined : row.isExpanded"
    >
      <div
          data-gr-tree-row
          class="gr-tree__row py-2 px-2"
          :class="[
          treeProps.highlightCurrent && currentKey === row.node.key ? 'gr-tree__row--current' : '',
          row.isMatched ? 'gr-tree__row--matched' : '',
          dropTarget?.key === row.node.key && dropTarget.allowed && dropTarget.type === 'inner' ? 'gr-tree__row--drop-inner' : '',
          dropTarget?.key === row.node.key && dropTarget.allowed && dropTarget.type === 'prev' ? 'gr-tree__row--drop-prev' : '',
          dropTarget?.key === row.node.key && dropTarget.allowed && dropTarget.type === 'next' ? 'gr-tree__row--drop-next' : '',
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
    --gr-tree-row-pr: 8px;
    --gr-tree-row-color: var(--fg);
    --gr-tree-row-hover-bg: color-mix(in srgb, var(--primary, #000) 10%, transparent);
    --gr-tree-row-current-bg: color-mix(in srgb, var(--primary, #000) 5%, transparent);
    --gr-tree-row-current-hover-bg: color-mix(in srgb, var(--primary, #000) 16%, transparent);
    --gr-tree-drag-handle-size: 24px;
    --gr-tree-drag-handle-mr: 0;
    --gr-tree-drag-handle-radius: 6px;
    --gr-tree-drag-handle-color: inherit;
    --gr-tree-drag-handle-opacity: 0.55;
    --gr-tree-drag-handle-hover-bg: color-mix(in srgb, var(--muted, #000) 22%, transparent);
    --gr-tree-drag-handle-hover-color: var(--gr-tree-drag-handle-color);
    --gr-tree-drag-handle-hover-opacity: 0.9;
    --gr-tree-drag-handle-disabled-opacity: 0.25;
    --gr-tree-toggle-size: 24px;
    --gr-tree-toggle-mr: 0;
    --gr-tree-toggle-radius: 6px;
    --gr-tree-toggle-color: inherit;
    --gr-tree-toggle-hover-bg: color-mix(in srgb, var(--muted, #000) 25%, transparent);
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
    padding-right: var(--gr-tree-row-pr);
    cursor: default;
    user-select: none;
    outline: none;
    color: var(--gr-tree-row-color);
}

.gr-tree__row:hover {
    background: var(--gr-tree-row-hover-bg);
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
    outline: 2px solid color-mix(in srgb, var(--primary, #000) 40%, transparent);
}

.gr-tree__row--drop-prev::before,
.gr-tree__row--drop-next::after {
    content: '';
    position: absolute;
    left: 8px;
    right: 8px;
    height: 2px;
    background: color-mix(in srgb, var(--primary, #000) 55%, transparent);
}

.gr-tree__row--drop-prev::before {
    top: 2px;
}

.gr-tree__row--drop-next::after {
    bottom: 2px;
}
</style>
