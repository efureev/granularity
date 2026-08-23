import type { GrComponentSize } from '../shared/sizes'

import type { Component } from 'vue'

export type GrSegmentedVariant = 'pills' | 'button'
export type GrSegmentedSize = GrComponentSize

/** Направление ряда сегментов. Вертикаль — боковые фильтры. */
export const GR_SEGMENTED_ORIENTATIONS = ['horizontal', 'vertical'] as const
export type GrSegmentedOrientation = typeof GR_SEGMENTED_ORIENTATIONS[number]
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
export const rootBaseClass
  = 'relative inline-grid min-w-0 items-stretch rounded-[var(--gr-segmented-radius)] p-[var(--gr-segmented-padding)] transition-colors duration-[var(--gr-duration-fast)]'

/** Направление потока: остальную раскладку задают `gridTemplate*` в стиле корня. */
export const rootOrientationClassMap: Record<GrSegmentedOrientation, string> = {
  horizontal: 'grid-flow-col',
  vertical: 'grid-flow-row',
}
export const rootVariantClassMap: Record<GrSegmentedVariant, string> = {
  pills: 'border border-[var(--gr-segmented-track-brd)] bg-[var(--gr-segmented-track-bg)] text-[var(--gr-segmented-item-color)]',
  button: 'border border-[var(--gr-segmented-track-brd)] bg-[var(--gr-segmented-track-bg)] text-[var(--gr-segmented-item-color)] shadow-[var(--gr-segmented-track-shadow)]',
}
export const rootBlockClass = 'w-full'
export const rootDisabledClass = 'text-[var(--gr-disabled-fg)]'
export const indicatorBaseClass
  = 'pointer-events-none absolute left-0 top-0 rounded-[calc(var(--gr-segmented-radius)-var(--gr-segmented-padding))] transition-[transform,width,height,opacity] ease-[var(--gr-ease-out)]'
export const indicatorVariantClassMap: Record<GrSegmentedVariant, string> = {
  pills: 'border border-[var(--gr-segmented-indicator-brd)] bg-[var(--gr-segmented-indicator-bg)] shadow-[var(--gr-segmented-indicator-shadow)]',
  button: 'border border-[var(--gr-segmented-indicator-brd)] bg-[var(--gr-segmented-indicator-bg)] shadow-[var(--gr-segmented-indicator-shadow)]',
}
export const itemBaseClass
  = 'group/segmented-item relative z-[1] inline-flex min-h-[var(--gr-segmented-min-height)] min-w-0 items-center justify-center gap-2 rounded-[calc(var(--gr-segmented-radius)-var(--gr-segmented-padding))] px-[var(--gr-segmented-item-px)] py-[var(--gr-segmented-item-py)] text-[length:var(--gr-segmented-font-size)] leading-[var(--gr-segmented-line-height)] font-[var(--gr-segmented-font-weight)] text-[var(--gr-segmented-item-color)] transition-colors duration-[var(--gr-duration-fast)] select-none focus:outline-none focus-visible:shadow-[0_0_0_2px_var(--gr-ring),0_0_0_4px_var(--gr-bg)]'
export const itemVariantClassMap: Record<GrSegmentedVariant, string> = {
  pills: '',
  button: '',
}
export const itemSelectedClass = 'text-[var(--gr-segmented-item-selected-color)]'
/**
 * Недоступный сегмент гасится токеном, а не `opacity`: прозрачность разбавляет
 * выверенные на AA токены текста и роняет контраст подписи.
 */
export const itemDisabledClass = 'cursor-not-allowed text-[var(--gr-disabled-fg)]'
export const itemEnabledClass = 'cursor-pointer hover:text-[var(--gr-segmented-item-hover-color)]'
export const itemLabelClass = 'truncate'
export const itemIconClass = 'h-4 w-4 shrink-0'
export const itemSpinnerClass = 'h-4 w-4 shrink-0 animate-spin'
export const iconOnlyClass = 'gap-0'
const rootSizeStyles: Record<GrSegmentedSize, Record<string, string>> = {
  xs: {
    '--gr-segmented-radius': '9999px',
    '--gr-segmented-padding': '4px',
    '--gr-segmented-item-px': '10px',
    '--gr-segmented-item-py': '4px',
    '--gr-segmented-font-size': '0.75rem',
    '--gr-segmented-line-height': '1rem',
    '--gr-segmented-font-weight': '600',
    '--gr-segmented-min-height': '24px',
  },
  sm: {
    '--gr-segmented-radius': '9999px',
    '--gr-segmented-padding': '4px',
    '--gr-segmented-item-px': '12px',
    '--gr-segmented-item-py': '6px',
    '--gr-segmented-font-size': '0.75rem',
    '--gr-segmented-line-height': '1rem',
    '--gr-segmented-font-weight': '600',
    '--gr-segmented-min-height': '28px',
  },
  md: {
    '--gr-segmented-radius': '9999px',
    '--gr-segmented-padding': '4px',
    '--gr-segmented-item-px': '14px',
    '--gr-segmented-item-py': '8px',
    '--gr-segmented-font-size': '0.875rem',
    '--gr-segmented-line-height': '1.25rem',
    '--gr-segmented-font-weight': '600',
    '--gr-segmented-min-height': '40px',
  },
  lg: {
    '--gr-segmented-radius': '9999px',
    '--gr-segmented-padding': '4px',
    '--gr-segmented-item-px': '16px',
    '--gr-segmented-item-py': '10px',
    '--gr-segmented-font-size': '0.9375rem',
    '--gr-segmented-line-height': '1.25rem',
    '--gr-segmented-font-weight': '600',
    '--gr-segmented-min-height': '46px',
  },
}
const rootVariantStyles: Record<GrSegmentedVariant, Record<string, string>> = {
  pills: {
    '--gr-segmented-track-bg': 'var(--gr-muted)',
    '--gr-segmented-track-brd': 'var(--gr-brd)',
    '--gr-segmented-track-shadow': 'none',
    '--gr-segmented-indicator-bg': 'var(--gr-card)',
    '--gr-segmented-indicator-brd': 'color-mix(in srgb, var(--gr-card) 84%, var(--gr-brd) 16%)',
    '--gr-segmented-indicator-shadow': 'var(--gr-shadow-1), var(--gr-segmented-indicator-highlight-shadow, 0 0 0 0 transparent)',
    '--gr-segmented-item-color': 'var(--gr-muted-fg)',
    '--gr-segmented-item-selected-color': 'var(--gr-fg)',
    '--gr-segmented-item-hover-color': 'var(--gr-fg)',
  },
  button: {
    '--gr-segmented-track-bg': 'var(--gr-card)',
    '--gr-segmented-track-brd': 'var(--gr-brd)',
    '--gr-segmented-track-shadow': 'var(--gr-shadow-1)',
    '--gr-segmented-indicator-bg': 'var(--gr-primary)',
    '--gr-segmented-indicator-brd': 'color-mix(in srgb, var(--gr-primary) 88%, var(--gr-brd) 12%)',
    '--gr-segmented-indicator-shadow': 'var(--gr-shadow-2)',
    '--gr-segmented-item-color': 'var(--gr-muted-fg)',
    '--gr-segmented-item-selected-color': 'var(--gr-primary-fg)',
    '--gr-segmented-item-hover-color': 'var(--gr-fg)',
  },
}
export function grSegmentedRootClass(options: {
  variant: GrSegmentedVariant
  orientation: GrSegmentedOrientation
  block: boolean
  disabled: boolean
}): string {
  return [
    rootBaseClass,
    rootOrientationClassMap[options.orientation],
    rootVariantClassMap[options.variant],
    options.block ? rootBlockClass : '',
    options.disabled ? rootDisabledClass : '',
  ].filter(Boolean).join(' ')
}
/**
 * Радиус дорожки в вертикали — пилюля **одной строки**, а не всей колонки.
 * `9999px` выверен под короткий горизонтальный ряд; на высокой колонке он
 * превращает дорожку в эллипс. Формула повторяет высоту сегмента, поэтому
 * скругление у колонки ровно такое же, как у ряда, и сегменты внутри остаются
 * пилюлями: они считают свой радиус от этого же значения.
 */
const verticalRadiusStyle = {
  '--gr-segmented-radius': 'calc(var(--gr-segmented-min-height) / 2 + var(--gr-segmented-padding))',
}

export function grSegmentedRootStyle(options: {
  variant: GrSegmentedVariant
  size: GrSegmentedSize
  orientation: GrSegmentedOrientation
}): Record<string, string> {
  return {
    ...rootSizeStyles[options.size],
    ...rootVariantStyles[options.variant],
    ...(options.orientation === 'vertical' ? verticalRadiusStyle : {}),
  }
}
export function grSegmentedIndicatorClass(variant: GrSegmentedVariant): string {
  return [indicatorBaseClass, indicatorVariantClassMap[variant]].join(' ')
}
export function grSegmentedItemClass(options: {
  variant: GrSegmentedVariant
  selected: boolean
  disabled: boolean
  iconOnly: boolean
}): string {
  return [
    itemBaseClass,
    itemVariantClassMap[options.variant],
    options.selected ? itemSelectedClass : '',
    options.disabled ? itemDisabledClass : itemEnabledClass,
    options.iconOnly ? iconOnlyClass : '',
  ].filter(Boolean).join(' ')
}
export const grSegmentedItemLabelClass = itemLabelClass
export const grSegmentedItemIconClass = itemIconClass
export const grSegmentedItemSpinnerClass = itemSpinnerClass
