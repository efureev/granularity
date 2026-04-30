import type { Ref, ShallowRef } from 'vue'
import { ref, shallowRef } from 'vue'
import type {
  GrTreeAllowDropType,
  GrTreeKey,
  GrTreeNode,
  GrTreeNodeDropType,
} from './grTreeTypes'

export type GrTreeDropTarget = {
  key: GrTreeKey
  type: GrTreeNodeDropType
  allowed: boolean
}

export type GrTreeInteractionOptions<T> = {
  draggable?: boolean
  allowDrop?: (draggingNode: GrTreeNode<T>, dropNode: GrTreeNode<T>, type: GrTreeAllowDropType) => boolean
  allowDrag?: (draggingNode: GrTreeNode<T>) => boolean
}

export type GrTreeInteractionEmitters<T> = {
  emitNodeClick: (data: T, node: GrTreeNode<T>) => void
  emitNodeExpand: (data: T, node: GrTreeNode<T>) => void
  emitNodeCollapse: (data: T, node: GrTreeNode<T>) => void
  emitNodeDrop: (draggingNode: GrTreeNode<T>, dropNode: GrTreeNode<T>, dropType: GrTreeNodeDropType) => void
}

export type GrTreeInteractionContext<T> = {
  hoveredKey: Ref<GrTreeKey | undefined>
  draggingNode: ShallowRef<GrTreeNode<T> | null>
  dropTarget: ShallowRef<GrTreeDropTarget | null>
  canDrag: (node: GrTreeNode<T>) => boolean
  canDrop: (drag: GrTreeNode<T>, target: GrTreeNode<T>, type: GrTreeAllowDropType) => boolean
  resetDragState: () => void
  emitNodeClick: (data: T, node: GrTreeNode<T>) => void
  emitNodeExpand: (data: T, node: GrTreeNode<T>) => void
  emitNodeCollapse: (data: T, node: GrTreeNode<T>) => void
  emitNodeDrop: (draggingNode: GrTreeNode<T>, dropNode: GrTreeNode<T>, dropType: GrTreeNodeDropType) => void
}

export function createGrTreeInteractionContext<T>(
  options: GrTreeInteractionOptions<T>,
  emitters: GrTreeInteractionEmitters<T>,
): GrTreeInteractionContext<T> {
  const hoveredKey = ref<GrTreeKey | undefined>(undefined)
  const draggingNode = shallowRef<GrTreeNode<T> | null>(null)
  const dropTarget = shallowRef<GrTreeDropTarget | null>(null)

  function canDrag(node: GrTreeNode<T>): boolean {
    if (!options.draggable)
      return false

    if (options.allowDrag)
      return options.allowDrag(node)

    return true
  }

  function canDrop(drag: GrTreeNode<T>, target: GrTreeNode<T>, type: GrTreeAllowDropType): boolean {
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