import type { HTMLAttributes } from 'vue'

import type { DsTreeInteractionContext } from './dsTreeInteractionContext'
import type { DsTreeStore } from './dsTreeStore'
import type {
  DsTreeAllowDropType,
  DsTreeKey,
  DsTreeNode,
} from './dsTreeTypes'

export type NodeKeyProp<T extends object> = Extract<keyof T, string>

export type DsTreePropsMap = {
  children?: string
  label?: string
}

export type DsTreeFilterNodeMethod<T extends object = any> = (value: string, data: T, node?: DsTreeNode<T>) => boolean

export type DsTreeBranchLineColor<T extends object = any> = string | ((node: DsTreeNode<T>) => string | undefined | null)

export type DsTreeVisibleRow<T extends object> = {
  node: DsTreeNode<T>
  isExpanded: boolean
  isLeaf: boolean
  isMatched: boolean
}

export type DsTreeVisibleTreeRow<T extends object> = DsTreeVisibleRow<T> & {
  children: DsTreeVisibleTreeRow<T>[]
}

export type DsTreeClassValue = HTMLAttributes['class']
export type DsTreeNodeClass<T extends object> = DsTreeClassValue | ((row: DsTreeVisibleRow<T>) => DsTreeClassValue)

export type DsTreeDataProps<T extends object> = {
  data: T[]
  props?: DsTreePropsMap
  nodeKey?: NodeKeyProp<T> | 'id'
  defaultExpandedKeys?: DsTreeKey[]
  filterNodeMethod?: DsTreeFilterNodeMethod<T>
}

export type DsTreeViewProps<T extends object> = {
  highlightCurrent?: boolean
  expandIcon?: string
  collapseIcon?: string
  toggleIconRotate?: boolean
  branchLine?: boolean
  branchLineColor?: DsTreeBranchLineColor<T>
  branchLineActiveColor?: DsTreeBranchLineColor<T>
  rowClass?: DsTreeNodeClass<T>
  dragHandleClass?: DsTreeNodeClass<T>
  toggleClass?: DsTreeNodeClass<T>
  toggleIconClass?: DsTreeNodeClass<T>
  toggleSpacerClass?: DsTreeNodeClass<T>
  contentClass?: DsTreeNodeClass<T>
}

export type DsTreeInteractionProps<T extends object> = {
  draggable?: boolean
  dragHandleIcon?: string
  allowDrop?: (draggingNode: DsTreeNode<T>, dropNode: DsTreeNode<T>, type: DsTreeAllowDropType) => boolean
  allowDrag?: (draggingNode: DsTreeNode<T>) => boolean
}

export type DsTreeInternalProps<T extends object> = {
  internalRows?: DsTreeVisibleTreeRow<T>[]
  internalNested?: boolean
  internalStore?: DsTreeStore<T>
  internalInteractionContext?: DsTreeInteractionContext<T>
}

export type DsTreeProps<T extends object> = DsTreeDataProps<T>
  & DsTreeViewProps<T>
  & DsTreeInteractionProps<T>
  & DsTreeInternalProps<T>