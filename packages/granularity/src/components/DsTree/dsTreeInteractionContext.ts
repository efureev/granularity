import type { Ref, ShallowRef } from 'vue'
import { ref, shallowRef } from 'vue'
import type {
  DsTreeAllowDropType,
  DsTreeKey,
  DsTreeNode,
  DsTreeNodeDropType,
} from './dsTreeTypes'

export type DsTreeDropTarget = {
  key: DsTreeKey
  type: DsTreeNodeDropType
  allowed: boolean
}

export type DsTreeInteractionOptions<T> = {
  draggable?: boolean
  allowDrop?: (draggingNode: DsTreeNode<T>, dropNode: DsTreeNode<T>, type: DsTreeAllowDropType) => boolean
  allowDrag?: (draggingNode: DsTreeNode<T>) => boolean
}

export type DsTreeInteractionEmitters<T> = {
  emitNodeClick: (data: T, node: DsTreeNode<T>) => void
  emitNodeExpand: (data: T, node: DsTreeNode<T>) => void
  emitNodeCollapse: (data: T, node: DsTreeNode<T>) => void
  emitNodeDrop: (draggingNode: DsTreeNode<T>, dropNode: DsTreeNode<T>, dropType: DsTreeNodeDropType) => void
}

export type DsTreeInteractionContext<T> = {
  hoveredKey: Ref<DsTreeKey | undefined>
  draggingNode: ShallowRef<DsTreeNode<T> | null>
  dropTarget: ShallowRef<DsTreeDropTarget | null>
  canDrag: (node: DsTreeNode<T>) => boolean
  canDrop: (drag: DsTreeNode<T>, target: DsTreeNode<T>, type: DsTreeAllowDropType) => boolean
  resetDragState: () => void
  emitNodeClick: (data: T, node: DsTreeNode<T>) => void
  emitNodeExpand: (data: T, node: DsTreeNode<T>) => void
  emitNodeCollapse: (data: T, node: DsTreeNode<T>) => void
  emitNodeDrop: (draggingNode: DsTreeNode<T>, dropNode: DsTreeNode<T>, dropType: DsTreeNodeDropType) => void
}

export function createDsTreeInteractionContext<T>(
  options: DsTreeInteractionOptions<T>,
  emitters: DsTreeInteractionEmitters<T>,
): DsTreeInteractionContext<T> {
  const hoveredKey = ref<DsTreeKey | undefined>(undefined)
  const draggingNode = shallowRef<DsTreeNode<T> | null>(null)
  const dropTarget = shallowRef<DsTreeDropTarget | null>(null)

  function canDrag(node: DsTreeNode<T>): boolean {
    if (!options.draggable)
      return false

    if (options.allowDrag)
      return options.allowDrag(node)

    return true
  }

  function canDrop(drag: DsTreeNode<T>, target: DsTreeNode<T>, type: DsTreeAllowDropType): boolean {
    if (!options.allowDrop)
      return true

    return options.allowDrop(drag, target, type)
  }

  function resetDragState() {
    draggingNode.value = null
    dropTarget.value = null
  }

  return {
    hoveredKey,
    draggingNode,
    dropTarget,
    canDrag,
    canDrop,
    resetDragState,
    ...emitters,
  }
}