import type { ComputedRef, InjectionKey } from 'vue'

import type { GrComponentSize } from '../shared/sizes'

export type GrCollapseValue = string | number

export type GrCollapseModelValue = GrCollapseValue | GrCollapseValue[] | undefined

/**
 * Уровень заголовка секции. APG для accordion требует, чтобы он соответствовал
 * структуре страницы: аккордеон в разделе `<h4>` с захардкоженным `<h3>` рвёт
 * навигацию по заголовкам.
 */
export const GR_COLLAPSE_HEADING_LEVELS = [2, 3, 4, 5, 6] as const

export type GrCollapseHeadingLevel = typeof GR_COLLAPSE_HEADING_LEVELS[number]

/** Сторона шеврона относительно заголовка — логическая, не физическая (RTL). */
export const GR_COLLAPSE_ICON_POSITIONS = ['start', 'end'] as const

export type GrCollapseIconPosition = typeof GR_COLLAPSE_ICON_POSITIONS[number]

/**
 * Async-guard на переключение секции: `false` отменяет его. Второй аргумент —
 * куда идёт секция (`true` — раскрывается), чтобы «сохранить изменения?»
 * спрашивалось только на сворачивании.
 */
export type GrCollapseBeforeChange = (
  name: GrCollapseValue,
  expanding: boolean,
) => boolean | void | Promise<boolean | void>

export type GrCollapseContext = {
  accordion: ComputedRef<boolean>
  disabled: ComputedRef<boolean>
  size: ComputedRef<GrComponentSize>
  headingLevel: ComputedRef<GrCollapseHeadingLevel>
  expandIconPosition: ComputedRef<GrCollapseIconPosition>
  isActive: (name: GrCollapseValue) => boolean
  toggle: (name: GrCollapseValue) => void
}

export const GR_COLLAPSE_CONTEXT: InjectionKey<GrCollapseContext> = Symbol('GR_COLLAPSE_CONTEXT')
