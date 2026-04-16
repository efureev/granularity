export type DsTreeKey = string | number

export type DsTreeNodeDropType = 'prev' | 'inner' | 'next'
export type DsTreeAllowDropType = DsTreeNodeDropType

export type DsTreeNode<T = any> = {
  key: DsTreeKey
  label: string
  data: T
  level: number
  parent?: DsTreeNode<T>
  childNodes: DsTreeNode<T>[]
}

export type DsTreeNodeTarget<T = any> = DsTreeKey | DsTreeNode<T> | T

export type DsTreeInstance<T = any> = {
  filter: (value: string) => void
  setCurrentKey: (key?: DsTreeKey) => void
  getCurrentKey: () => DsTreeKey | undefined
  appendNode: (data: T, parent: DsTreeNodeTarget<T>) => DsTreeNode<T> | undefined
  removeNode: (node: DsTreeNodeTarget<T>) => boolean
  insertNodeBefore: (data: T, referenceNode: DsTreeNodeTarget<T>) => DsTreeNode<T> | undefined
  insertNodeAfter: (data: T, referenceNode: DsTreeNodeTarget<T>) => DsTreeNode<T> | undefined
  getCurrentNode: () => DsTreeNode<T> | undefined
  setCurrentNode: (node?: DsTreeNodeTarget<T>) => boolean
  getNode: (key: DsTreeKey) => DsTreeNode<T> | undefined
}
