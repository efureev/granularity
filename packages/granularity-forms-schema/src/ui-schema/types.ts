import type { Component } from 'vue'

import type { GrSchemaOption } from '../model'

/**
 * Число колонок ограничено списком намеренно.
 *
 * Классы сетки — единственное, что пакет рисует сам, и они обязаны быть в
 * safelist перечислены целиком. Произвольные 1…12 на пять брейкпойнтов дали бы
 * под сотню токенов ради раскладок, которых никто не строит.
 */
export type GrUiColumnCount = 1 | 2 | 3 | 4 | 6 | 12
export type GrUiBreakpoint = 'base' | 'sm' | 'md' | 'lg'
export type GrUiColumns = GrUiColumnCount | Partial<Record<GrUiBreakpoint, GrUiColumnCount>>
export type GrUiSpan =
  | GrUiColumnCount
  | 'full'
  | Partial<Record<GrUiBreakpoint, GrUiColumnCount | 'full'>>

export interface GrUiConditionRule {
  /**
   * Путь источника. Три формы:
   * `user.type` — от корня; `../type` — соседнее поле той же строки массива;
   * `./sub.flag` — вниз от текущего узла.
   */
  path: string
  eq?: unknown
  ne?: unknown
  in?: readonly unknown[]
  notIn?: readonly unknown[]
  gt?: number
  gte?: number
  lt?: number
  lte?: number
  truthy?: boolean
  /** Пусто по правилу ядра: `0` и `false` пустыми не считаются. */
  empty?: boolean
  /** Источник регулярки строкой: `uiSchema` обязана переживать JSON. */
  matches?: string
  matchesFlags?: string
}

export interface GrUiConditionContext {
  get: (path: string) => unknown
  model: Record<string, unknown>
  /** Инстанс-путь узла, к которому относится условие. */
  name: string
  indices: number[]
}

export type GrUiCondition =
  | GrUiConditionRule
  | readonly GrUiConditionRule[]
  | { all: readonly GrUiCondition[] }
  | { any: readonly GrUiCondition[] }
  | { not: GrUiCondition }
  | ((ctx: GrUiConditionContext) => boolean)

export interface GrUiArrayOptions {
  itemLabel?: string | ((item: unknown, index: number) => string)
  addLabel?: string
  removeLabel?: string
  emptyText?: string
  sortable?: boolean
  duplicable?: boolean
  itemDefault?: unknown | (() => unknown)
  columns?: GrUiColumns
  min?: number
  max?: number
}

export interface GrUiFieldOptions {
  label?: string
  hint?: string
  placeholder?: string

  /** Имя записи реестра. */
  widget?: string
  /** Готовый компонент — сильнее `widget`. */
  component?: Component
  /** Пропы поверх посчитанных реестром. */
  controlProps?: Record<string, unknown>
  /** Варианты, которых схема не знает: справочник с сервера. */
  options?: GrSchemaOption[]

  span?: GrUiSpan
  order?: number

  hidden?: boolean
  when?: GrUiCondition
  readonly?: boolean | GrUiCondition
  disabled?: boolean | GrUiCondition
  /** Обязательность поверх схемы — в обе стороны. */
  required?: boolean
  /** Стирать значение, когда поле скрылось условием. */
  clearOnHide?: boolean

  labelPosition?: 'top' | 'start'
  labelWidth?: string | number
  showMessage?: boolean

  array?: GrUiArrayOptions
}

export interface GrUiSection {
  /** Идентификатор — им же адресуется слот секции. */
  id: string
  title?: string
  description?: string
  headingLevel?: 2 | 3 | 4 | 5 | 6
  landmark?: boolean
  columns?: GrUiColumns
  /** Шаблонные пути по порядку. `'*'` — все, не попавшие в другие секции. */
  fields: string[]
  when?: GrUiCondition
}

export interface GrUiLayout {
  columns?: GrUiColumns
  sections?: GrUiSection[]
}

export interface GrUiSchema {
  layout?: GrUiLayout
  /** Ключ — шаблонный путь: `user.email`, `items.*.qty`. */
  fields?: Record<string, GrUiFieldOptions>
  /** Умолчания на все поля. */
  defaults?: Pick<GrUiFieldOptions, 'labelPosition' | 'labelWidth' | 'showMessage' | 'span'>
  /** Порядок корневых полей, когда секций нет. `'*'` — остальные по схеме. */
  order?: string[]
  /** Не рендерить вовсе — в отличие от условного `when`. */
  hidden?: string[]
}

/** Итог слияния `uiSchema` и узла схемы. */
export interface GrResolvedFieldUi {
  label?: string
  hint?: string
  placeholder?: string
  widget?: string
  component?: Component
  controlProps: Record<string, unknown>
  options?: GrSchemaOption[]
  span?: GrUiSpan
  visible: boolean
  readonly: boolean
  disabled: boolean
  required: boolean
  clearOnHide: boolean
  labelPosition?: 'top' | 'start'
  labelWidth?: string | number
  showMessage: boolean
  array?: GrUiArrayOptions
}
