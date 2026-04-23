import type { InputHTMLAttributes } from 'vue'
import type { DsInputSize } from '../DsInput/DsInput.vue'
import type { DsTreeFilterNodeMethod, DsTreeKey, DsTreePropsMap } from '../DsTree'
import type { DsTreeSelectState } from './dsTreeSelectStyles'

export type DsTreeSelectModelValue = DsTreeKey | DsTreeKey[] | null

export type DsTreeSelectValueDisplay = 'label' | 'path'

type NodeKeyProp<T> = keyof T & string

/**
 * Пропсы публичного DS-примитива «TreeSelect».
 */
export interface DsTreeSelectProps<T extends object = any> {
  modelValue: DsTreeSelectModelValue
  data: T[]
  props?: DsTreePropsMap
  nodeKey?: NodeKeyProp<T> | 'id'
  defaultExpandedKeys?: DsTreeKey[]
  disabled?: boolean

  placeholder?: string
  size?: DsInputSize
  invalid?: boolean
  state?: DsTreeSelectState

  multiple?: boolean
  clearable?: boolean

  /** Как отображать выбранное значение в single-режиме. */
  valueDisplay?: DsTreeSelectValueDisplay

  filterable?: boolean
  filterPlaceholder?: string
  filterInputmode?: InputHTMLAttributes['inputmode']
  filterNodeMethod?: DsTreeFilterNodeMethod<T>

  closeOnSelect?: boolean
  dropdownMaxHeight?: number
}
