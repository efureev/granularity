import type { GrControlShape } from '../shared/controlShape'
import type { GrComponentSize } from '../shared/sizes'

import type { Component } from 'vue'

export type GrSegmentedVariant = 'pills' | 'button'
export type GrSegmentedSize = GrComponentSize

/** Направление ряда сегментов. Вертикаль — боковые фильтры. */
export const GR_SEGMENTED_ORIENTATIONS = ['horizontal', 'vertical'] as const

/**
 * Как ряд делит ширину между сегментами. Значимо только в горизонтальном ряду с
 * `block`: без него ширина и так по содержимому, а в вертикали колонка одна.
 */
export const GR_SEGMENTED_ITEM_WIDTHS = ['equal', 'content'] as const
export type GrSegmentedOrientation = typeof GR_SEGMENTED_ORIENTATIONS[number]
export type GrSegmentedItemWidth = typeof GR_SEGMENTED_ITEM_WIDTHS[number]

export type GrSegmentedValue = string | number
export type GrSegmentedOption = {
  value: GrSegmentedValue
  label?: string
  icon?: Component
  disabled?: boolean
  /**
   * Сегмент занят: вместо иконки крутится спиннер, выбор не принимается.
   * От `disabled` отличается смыслом — сегмент доступен, но сейчас работает.
   */
  loading?: boolean
  /**
   * Доступное имя сегмента. Обязательно для icon-only опций: иконка декоративна
   * (`aria-hidden`), и без этого у сегмента нет имени вовсе — скринридер объявит
   * пустую кнопку. Когда есть `label`, имя берётся из него, и поле не нужно.
   */
  ariaLabel?: string
}
const flag = (on: boolean | undefined): '' | undefined => (on ? '' : undefined)

/**
 * Вид сегментов — атрибуты корня, а не классы и инлайн-переменные
 * (`docs/markup-weight.md`): вариант, ступень, форма, растяжение и деление ширины.
 * Ориентацию, ошибку и недоступность лист читает по `aria-orientation`,
 * `aria-invalid` и `aria-disabled`, выбор сегмента — по его
 * `aria-checked`. Деление ширины значимо только в горизонтальном ряду с `block`.
 */
export function grSegmentedLookAttrs(options: {
  variant: GrSegmentedVariant
  size: GrSegmentedSize
  shape: GrControlShape
  block: boolean
  vertical: boolean
  itemWidth: GrSegmentedItemWidth
}): Record<string, string | undefined> {
  return {
    'data-gr-variant': options.variant,
    'data-gr-size': options.size,
    'data-gr-shape': options.shape,
    'data-gr-block': flag(options.block),
    'data-gr-item-width': options.block && !options.vertical && options.itemWidth === 'content' ? 'content' : undefined,
  }
}
