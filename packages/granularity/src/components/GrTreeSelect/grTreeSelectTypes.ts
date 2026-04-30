import type { InputHTMLAttributes } from 'vue'
import type { GrInputSize } from '../GrInput/GrInput.vue'
import type { GrTreeFilterNodeMethod, GrTreeKey, GrTreePropsMap } from '../GrTree'
import type { GrTreeSelectState } from './grTreeSelectStyles'

export type GrTreeSelectModelValue = GrTreeKey | GrTreeKey[] | null

export type GrTreeSelectValueDisplay = 'label' | 'path'

type NodeKeyProp<T> = keyof T & string

/**
 * Пропсы публичного DS-примитива «TreeSelect».
 */
export interface GrTreeSelectProps<T extends object = any> {
  modelValue: GrTreeSelectModelValue
  data: T[]
  props?: GrTreePropsMap
  nodeKey?: NodeKeyProp<T> | 'id'
  defaultExpandedKeys?: GrTreeKey[]
  disabled?: boolean

  placeholder?: string
  size?: GrInputSize
  invalid?: boolean
  state?: GrTreeSelectState

  multiple?: boolean
  clearable?: boolean

  /** Как отображать выбранное значение в single-режиме. */
  valueDisplay?: GrTreeSelectValueDisplay

  filterable?: boolean
  filterPlaceholder?: string
  filterInputmode?: InputHTMLAttributes['inputmode']
  filterNodeMethod?: GrTreeFilterNodeMethod<T>

  closeOnSelect?: boolean
  dropdownMaxHeight?: number
}
