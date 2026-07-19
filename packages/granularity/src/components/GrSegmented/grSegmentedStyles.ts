import type { Component } from 'vue'
export type GrSegmentedVariant = 'pills' | 'button'
export type GrSegmentedSize = 'xs' | 'sm' | 'md' | 'lg'
export type GrSegmentedValue = string | number
export type GrSegmentedOption = {
  value: GrSegmentedValue
  label?: string
  icon?: Component
  disabled?: boolean
}
export const rootBaseClass =
  'relative inline-grid min-w-0 grid-flow-col items-stretch rounded-[var(--gr-segmented-radius)] p-[var(--gr-segmented-padding)] transition-colors duration-150'
export const rootVariantClassMap: Record<GrSegmentedVariant, string> = {
  pills: 'border border-[var(--gr-segmented-track-brd)] bg-[var(--gr-segmented-track-bg)] text-[var(--gr-segmented-item-color)]',
  button: 'border border-[var(--gr-segmented-track-brd)] bg-[var(--gr-segmented-track-bg)] text-[var(--gr-segmented-item-color)] shadow-[var(--gr-segmented-track-shadow)]',
}
export const rootBlockClass = 'w-full'
export const indicatorBaseClass =
  'pointer-events-none absolute left-0 top-0 rounded-[calc(var(--gr-segmented-radius)-var(--gr-segmented-padding))] transition-[transform,width,height,opacity] ease-out'
export const indicatorVariantClassMap: Record<GrSegmentedVariant, string> = {
  pills:  'border border-[var(--gr-segmented-indicator-brd)] bg-[var(--gr-segmented-indicator-bg)] shadow-[var(--gr-segmented-indicator-shadow)]',
  button: 'border border-[var(--gr-segmented-indicator-brd)] bg-[var(--gr-segmented-indicator-bg)] shadow-[var(--gr-segmented-indicator-shadow)]',
}
export const itemBaseClass =
  'group/segmented-item relative z-[1] inline-flex min-h-[var(--gr-segmented-min-height)] min-w-0 items-center justify-center gap-2 rounded-[calc(var(--gr-segmented-radius)-var(--gr-segmented-padding))] px-[var(--gr-segmented-item-px)] py-[var(--gr-segmented-item-py)] text-[length:var(--gr-segmented-font-size)] leading-[var(--gr-segmented-line-height)] font-[var(--gr-segmented-font-weight)] text-[var(--gr-segmented-item-color)] transition-colors duration-150 select-none focus:outline-none focus-visible:shadow-[0_0_0_2px_var(--ring),0_0_0_4px_var(--bg)]'
export const itemVariantClassMap: Record<GrSegmentedVariant, string> = {
  pills: '',
  button: '',
}
export const itemSelectedClass = 'text-[var(--gr-segmented-item-selected-color)]'
export const itemDisabledClass = 'cursor-not-allowed opacity-50'
export const itemEnabledClass = 'cursor-pointer hover:text-[var(--gr-segmented-item-hover-color)]'
export const itemLabelClass = 'truncate'
export const itemIconClass = 'h-4 w-4 shrink-0'
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
    '--gr-segmented-track-bg': 'var(--muted)',
    '--gr-segmented-track-brd': 'var(--brd)',
    '--gr-segmented-track-shadow': 'none',
    '--gr-segmented-indicator-bg': 'var(--card)',
    '--gr-segmented-indicator-brd': 'color-mix(in srgb, var(--card) 84%, var(--brd) 16%)',
    '--gr-segmented-indicator-shadow': 'var(--gr-shadow-1), var(--gr-segmented-indicator-highlight-shadow, 0 0 0 0 transparent)',
    '--gr-segmented-item-color': 'var(--muted-fg)',
    '--gr-segmented-item-selected-color': 'var(--fg)',
    '--gr-segmented-item-hover-color': 'var(--fg)',
  },
  button: {
    '--gr-segmented-track-bg': 'var(--card)',
    '--gr-segmented-track-brd': 'var(--brd)',
    '--gr-segmented-track-shadow': 'var(--gr-shadow-1)',
    '--gr-segmented-indicator-bg': 'var(--primary)',
    '--gr-segmented-indicator-brd': 'color-mix(in srgb, var(--primary) 88%, var(--brd) 12%)',
    '--gr-segmented-indicator-shadow': 'var(--gr-shadow-2)',
    '--gr-segmented-item-color': 'var(--muted-fg)',
    '--gr-segmented-item-selected-color': 'var(--primary-fg)',
    '--gr-segmented-item-hover-color': 'var(--fg)',
  },
}
export function grSegmentedRootClass(options: { variant: GrSegmentedVariant, block: boolean, disabled: boolean }): string {
  return [
    rootBaseClass,
    rootVariantClassMap[options.variant],
    options.block ? rootBlockClass : '',
    options.disabled ? 'opacity-70' : '',
  ].filter(Boolean).join(' ')
}
export function grSegmentedRootStyle(options: { variant: GrSegmentedVariant, size: GrSegmentedSize }): Record<string, string> {
  return {
    ...rootSizeStyles[options.size],
    ...rootVariantStyles[options.variant],
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
