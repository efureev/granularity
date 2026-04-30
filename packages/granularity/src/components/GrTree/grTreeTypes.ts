export type GrTreeKey = string | number

export type GrTreeNodeDropType = 'prev' | 'inner' | 'next'
export type GrTreeAllowDropType = GrTreeNodeDropType

export type GrTreeNode<T = any> = {
  key: GrTreeKey
  label: string
  data: T
  level: number
  parent?: GrTreeNode<T>
  childNodes: GrTreeNode<T>[]
}

export type GrTreeNodeTarget<T = any> = GrTreeKey | GrTreeNode<T> | T

export type GrTreeInstance<T = any> = {
  filter: (value: string) => void
  setCurrentKey: (key?: GrTreeKey) => void
  getCurrentKey: () => GrTreeKey | undefined
  appendNode: (data: T, parent: GrTreeNodeTarget<T>) => GrTreeNode<T> | undefined
  removeNode: (node: GrTreeNodeTarget<T>) => boolean
  insertNodeBefore: (data: T, referenceNode: GrTreeNodeTarget<T>) => GrTreeNode<T> | undefined
  insertNodeAfter: (data: T, referenceNode: GrTreeNodeTarget<T>) => GrTreeNode<T> | undefined
  getCurrentNode: () => GrTreeNode<T> | undefined
  setCurrentNode: (node?: GrTreeNodeTarget<T>) => boolean
  getNode: (key: GrTreeKey) => GrTreeNode<T> | undefined
}
