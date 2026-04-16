import type { DsTreeKey } from './dsTreeTypes'
import type {
  DsTreeDataProps,
  DsTreePropsMap,
} from './dsTreeProps'

const DEFAULT_CHILDREN_KEY = 'children'
const DEFAULT_LABEL_KEY = 'label'

export type DsTreeDataAdapterOptions<T extends object> = Pick<DsTreeDataProps<T>, 'props' | 'nodeKey'>

export type DsTreeDataAdapter<T extends object> = {
  hasNodeKey: () => boolean
  getChildrenKey: () => string
  getLabelKey: () => string
  getLabel: (data: T) => string
  getChildren: (data: T) => T[]
  ensureChildren: (data: T) => T[]
  getNodeKey: (data: T, index: number, parentKey: DsTreeKey | undefined) => DsTreeKey
  getExplicitNodeKey: (data: T) => DsTreeKey | undefined
}

function isTreeKey(value: unknown): value is DsTreeKey {
  return typeof value === 'string' || typeof value === 'number'
}

function resolveMapValue(map: DsTreePropsMap | undefined, key: keyof DsTreePropsMap, fallback: string) {
  return map?.[key] ?? fallback
}

export function createDsTreeDataAdapter<T extends Record<string, any> = any>(
  options: DsTreeDataAdapterOptions<T>,
): DsTreeDataAdapter<T> {
  function hasNodeKey() {
    return options.nodeKey != null
  }

  function getChildrenKey() {
    return resolveMapValue(options.props, 'children', DEFAULT_CHILDREN_KEY)
  }

  function getLabelKey() {
    return resolveMapValue(options.props, 'label', DEFAULT_LABEL_KEY)
  }

  function getLabel(data: T): string {
    const key = getLabelKey() as keyof T
    const value = data[key]
    return value == null ? '' : String(value)
  }

  function getChildren(data: T): T[] {
    const key = getChildrenKey() as keyof T
    const value = data[key]
    return Array.isArray(value) ? (value as T[]) : []
  }

  function ensureChildren(data: T): T[] {
    const key = getChildrenKey()
    const value = (data as Record<string, unknown>)[key]
    if (Array.isArray(value))
      return value as T[]

    const children: T[] = []
    ;(data as Record<string, unknown>)[key] = children
    return children
  }

  function getExplicitNodeKey(data: T): DsTreeKey | undefined {
    if (options.nodeKey == null)
      return undefined

    const keyName = options.nodeKey as keyof T
    const value = data[keyName] as unknown
    return isTreeKey(value) ? value : undefined
  }

  function getNodeKey(data: T, index: number, parentKey: DsTreeKey | undefined): DsTreeKey {
    const explicitKey = getExplicitNodeKey(data)
    if (explicitKey != null)
      return explicitKey

    return parentKey == null ? index : `${String(parentKey)}:${index}`
  }

  return {
    hasNodeKey,
    getChildrenKey,
    getLabelKey,
    getLabel,
    getChildren,
    ensureChildren,
    getNodeKey,
    getExplicitNodeKey,
  }
}