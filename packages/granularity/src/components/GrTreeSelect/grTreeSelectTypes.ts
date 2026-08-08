import type { InputHTMLAttributes } from 'vue'
import type { GrInputSize } from '../GrInput/GrInput.vue'
import type { GrTreeFilterNodeMethod, GrTreeKey, GrTreePropsMap } from '../GrTree'
import type { GrTreeSelectState } from './grTreeSelectStyles'

export type GrTreeSelectModelValue = GrTreeKey | GrTreeKey[] | null

export type GrTreeSelectValueDisplay = 'label' | 'path'

type NodeKeyProp<T> = keyof T & string

/**
 * Пропсы публичного GR-примитива «TreeSelect».
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
  /**
   * Данные ещё едут. Панель показывает индикатор вместо «Нет данных» — иначе
   * пустой ответ и незагруженный выглядят одинаково.
   */
  loading?: boolean
  invalid?: boolean
  /** Только для чтения: значение видно, но не меняется. */
  readonly?: boolean
  /** Обязательное поле (`aria-required`). */
  required?: boolean
  /** Доступное имя вне `GrFormField`. */
  ariaLabel?: string
  state?: GrTreeSelectState

  multiple?: boolean
  /**
   * Чекбоксы в дереве вместо собственной галочки: отметка родителя каскадом
   * закрывает поддерево, полувыбранный родитель показывается `mixed`. Работает
   * только вместе с `multiple`.
   */
  showCheckbox?: boolean
  /** Отвязать родителей от детей: отметка перестаёт распространяться каскадом. */
  checkStrictly?: boolean
  clearable?: boolean

  /**
   * Контролируемое состояние панели (`v-model:open`). Без пропа панель ведёт
   * себя сама (uncontrolled), с ним — слушайте `update:open` и меняйте проп.
   */
  open?: boolean

  /** Имя для нативной формы: hidden input на каждый выбранный ключ. */
  name?: string

  /** Как отображать выбранное значение в single-режиме. */
  valueDisplay?: GrTreeSelectValueDisplay

  filterable?: boolean
  filterPlaceholder?: string
  filterInputmode?: InputHTMLAttributes['inputmode']
  filterNodeMethod?: GrTreeFilterNodeMethod<T>

  closeOnSelect?: boolean
  dropdownMaxHeight?: number
  /**
   * Виртуализация дерева в панели: в DOM живёт только окно вокруг вьюпорта.
   *
   * Скроллером в этом режиме становится само дерево, а не контейнер панели —
   * два вложенных скроллера дали бы две полосы прокрутки на одном списке.
   */
  virtual?: boolean
}
