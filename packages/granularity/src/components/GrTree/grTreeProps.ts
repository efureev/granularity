import type { HTMLAttributes } from 'vue'

import type { GrTreeInteractionContext } from './grTreeInteractionContext'
import type { GrTreeStore } from './grTreeStore'
import type {
  GrTreeAllowDropType,
  GrTreeKey,
  GrTreeNode,
} from './grTreeTypes'

export type NodeKeyProp<T extends object> = Extract<keyof T, string>

export type GrTreePropsMap = {
  children?: string
  label?: string
}

export type GrTreeFilterNodeMethod<T extends object = any> = (value: string, data: T, node?: GrTreeNode<T>) => boolean

export type GrTreeBranchLineColor<T extends object = any> = string | ((node: GrTreeNode<T>) => string | undefined | null)

export type GrTreeVisibleRow<T extends object> = {
  node: GrTreeNode<T>
  isExpanded: boolean
  isLeaf: boolean
  isMatched: boolean
}

export type GrTreeVisibleTreeRow<T extends object> = GrTreeVisibleRow<T> & {
  children: GrTreeVisibleTreeRow<T>[]
}

export type GrTreeClassValue = HTMLAttributes['class']
export type GrTreeNodeClass<T extends object> = GrTreeClassValue | ((row: GrTreeVisibleRow<T>) => GrTreeClassValue)

export type GrTreeDataProps<T extends object> = {
  data: T[]
  props?: GrTreePropsMap
  nodeKey?: NodeKeyProp<T> | 'id'
  defaultExpandedKeys?: GrTreeKey[]
  filterNodeMethod?: GrTreeFilterNodeMethod<T>
}

export type GrTreeViewProps<T extends object> = {
  highlightCurrent?: boolean
  expandIcon?: string
  collapseIcon?: string
  toggleIconRotate?: boolean
  branchLine?: boolean
  branchLineColor?: GrTreeBranchLineColor<T>
  branchLineActiveColor?: GrTreeBranchLineColor<T>
  rowClass?: GrTreeNodeClass<T>
  dragHandleClass?: GrTreeNodeClass<T>
  toggleClass?: GrTreeNodeClass<T>
  toggleIconClass?: GrTreeNodeClass<T>
  toggleSpacerClass?: GrTreeNodeClass<T>
  contentClass?: GrTreeNodeClass<T>
  /** i18n-метка кнопки "Перетащить" (default: 'Drag'). */
  dragLabel?: string
  /** i18n-метка кнопки "Развернуть" (default: 'Expand'). */
  expandLabel?: string
  /** i18n-метка кнопки "Свернуть" (default: 'Collapse'). */
  collapseLabel?: string
}

export type GrTreeInteractionProps<T extends object> = {
  draggable?: boolean
  dragHandleIcon?: string
  allowDrop?: (draggingNode: GrTreeNode<T>, dropNode: GrTreeNode<T>, type: GrTreeAllowDropType) => boolean
  allowDrag?: (draggingNode: GrTreeNode<T>) => boolean
}

export type GrTreeInternalProps<T extends object> = {
  internalRows?: GrTreeVisibleTreeRow<T>[]
  internalNested?: boolean
  internalStore?: GrTreeStore<T>
  internalInteractionContext?: GrTreeInteractionContext<T>
}

export type GrTreeProps<T extends object> = GrTreeDataProps<T>
  & GrTreeViewProps<T>
  & GrTreeInteractionProps<T>
  & GrTreeInternalProps<T>