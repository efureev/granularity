import type { GrTreeKey } from './grTreeTypes'
import type {
  GrTreeDataProps,
  GrTreePropsMap,
} from './grTreeProps'

const DEFAULT_CHILDREN_KEY = 'children'
const DEFAULT_LABEL_KEY = 'label'

export type GrTreeDataAdapterOptions<T extends object> = Pick<GrTreeDataProps<T>, 'props' | 'nodeKey'>

export type GrTreeDataAdapter<T extends object> = {
  hasNodeKey: () => boolean
  getChildrenKey: () => string
  getLabelKey: () => string
  getLabel: (data: T) => string
  getChildren: (data: T) => T[]
  ensureChildren: (data: T) => T[]
  getNodeKey: (data: T, index: number, parentKey: GrTreeKey | undefined) => GrTreeKey
  getExplicitNodeKey: (data: T) => GrTreeKey | undefined
}

function isTreeKey(value: unknown): value is GrTreeKey {
  return typeof value === 'string' || typeof value === 'number'
}

function resolveMapValue(map: GrTreePropsMap | undefined, key: keyof GrTreePropsMap, fallback: string) {
  return map?.[key] ?? fallback
}

export function createGrTreeDataAdapter<T extends Record<string, any> = any>(
  options: GrTreeDataAdapterOptions<T>,
): GrTreeDataAdapter<T> {
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

  function getExplicitNodeKey(data: T): GrTreeKey | undefined {
    if (options.nodeKey == null)
      return undefined

    const keyName = options.nodeKey as keyof T
    const value = data[keyName] as unknown
    return isTreeKey(value) ? value : undefined
  }

  function getNodeKey(data: T, index: number, parentKey: GrTreeKey | undefined): GrTreeKey {
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