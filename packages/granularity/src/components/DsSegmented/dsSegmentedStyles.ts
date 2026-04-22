import type { Component } from 'vue'
export type DsSegmentedVariant = 'pills' | 'button'
export type DsSegmentedSize = 'xs' | 'sm' | 'md' | 'lg'
export type DsSegmentedValue = string | number
export type DsSegmentedOption = {
  value: DsSegmentedValue
  label?: string
  icon?: Component
  disabled?: boolean
}
export const rootBaseClass =
  'relative inline-grid min-w-0 grid-flow-col items-stretch rounded-[var(--ds-segmented-radius)] p-[var(--ds-segmented-padding)] transition-colors duration-150'
export const rootVariantClassMap: Record<DsSegmentedVariant, string> = {
  pills: 'border border-[var(--ds-segmented-track-brd)] bg-[var(--ds-segmented-track-bg)] text-[var(--ds-segmented-item-color)]',
  button: 'border border-[var(--ds-segmented-track-brd)] bg-[var(--ds-segmented-track-bg)] text-[var(--ds-segmented-item-color)] shadow-[var(--ds-segmented-track-shadow)]',
}
export const rootBlockClass = 'w-full'
export const indicatorBaseClass =
  'pointer-events-none absolute left-0 top-0 rounded-[calc(var(--ds-segmented-radius)-var(--ds-segmented-padding))] transition-[transform,width,height,opacity] ease-out'
export const indicatorVariantClassMap: Record<DsSegmentedVariant, string> = {
  pills:  'border border-[var(--ds-segmented-indicator-brd)] bg-[var(--ds-segmented-indicator-bg)] shadow-[var(--ds-segmented-indicator-shadow)]',
  button: 'border border-[var(--ds-segmented-indicator-brd)] bg-[var(--ds-segmented-indicator-bg)] shadow-[var(--ds-segmented-indicator-shadow)]',
}
export const itemBaseClass =
  'group/segmented-item relative z-[1] inline-flex min-h-[var(--ds-segmented-min-height)] min-w-0 items-center justify-center gap-2 rounded-[calc(var(--ds-segmented-radius)-var(--ds-segmented-padding))] px-[var(--ds-segmented-item-px)] py-[var(--ds-segmented-item-py)] text-[length:var(--ds-segmented-font-size)] leading-[var(--ds-segmented-line-height)] font-[var(--ds-segmented-font-weight)] text-[var(--ds-segmented-item-color)] transition-colors duration-150 select-none focus:outline-none focus-visible:shadow-[0_0_0_2px_var(--ring),0_0_0_4px_var(--bg)]'
export const itemVariantClassMap: Record<DsSegmentedVariant, string> = {
  pills: '',
  button: '',
}
export const itemSelectedClass = 'text-[var(--ds-segmented-item-selected-color)]'
export const itemDisabledClass = 'cursor-not-allowed opacity-50'
export const itemEnabledClass = 'cursor-pointer hover:text-[var(--ds-segmented-item-hover-color)]'
export const itemLabelClass = 'truncate'
export const itemIconClass = 'h-4 w-4 shrink-0'
export const iconOnlyClass = 'gap-0'
const rootSizeStyles: Record<DsSegmentedSize, Record<string, string>> = {
  xs: {
    '--ds-segmented-radius': '9999px',
    '--ds-segmented-padding': '4px',
    '--ds-segmented-item-px': '10px',
    '--ds-segmented-item-py': '4px',
    '--ds-segmented-font-size': '0.75rem',
    '--ds-segmented-line-height': '1rem',
    '--ds-segmented-font-weight': '600',
    '--ds-segmented-min-height': '24px',
  },
  sm: {
    '--ds-segmented-radius': '9999px',
    '--ds-segmented-padding': '4px',
    '--ds-segmented-item-px': '12px',
    '--ds-segmented-item-py': '6px',
    '--ds-segmented-font-size': '0.75rem',
    '--ds-segmented-line-height': '1rem',
    '--ds-segmented-font-weight': '600',
    '--ds-segmented-min-height': '28px',
  },
  md: {
    '--ds-segmented-radius': '9999px',
    '--ds-segmented-padding': '4px',
    '--ds-segmented-item-px': '14px',
    '--ds-segmented-item-py': '8px',
    '--ds-segmented-font-size': '0.875rem',
    '--ds-segmented-line-height': '1.25rem',
    '--ds-segmented-font-weight': '600',
    '--ds-segmented-min-height': '40px',
  },
  lg: {
    '--ds-segmented-radius': '9999px',
    '--ds-segmented-padding': '4px',
    '--ds-segmented-item-px': '16px',
    '--ds-segmented-item-py': '10px',
    '--ds-segmented-font-size': '0.9375rem',
    '--ds-segmented-line-height': '1.25rem',
    '--ds-segmented-font-weight': '600',
    '--ds-segmented-min-height': '46px',
  },
}
const rootVariantStyles: Record<DsSegmentedVariant, Record<string, string>> = {
  pills: {
    '--ds-segmented-track-bg': 'var(--muted)',
    '--ds-segmented-track-brd': 'var(--brd)',
    '--ds-segmented-track-shadow': 'none',
    '--ds-segmented-indicator-bg': 'var(--card)',
    '--ds-segmented-indicator-brd': 'color-mix(in srgb, var(--card) 84%, var(--brd) 16%)',
    '--ds-segmented-indicator-shadow': 'var(--ds-shadow-1), var(--ds-segmented-indicator-highlight-shadow, 0 0 0 0 transparent)',
    '--ds-segmented-item-color': 'var(--muted-fg)',
    '--ds-segmented-item-selected-color': 'var(--fg)',
    '--ds-segmented-item-hover-color': 'var(--fg)',
  },
  button: {
    '--ds-segmented-track-bg': 'var(--card)',
    '--ds-segmented-track-brd': 'var(--brd)',
    '--ds-segmented-track-shadow': 'var(--ds-shadow-1)',
    '--ds-segmented-indicator-bg': 'var(--primary)',
    '--ds-segmented-indicator-brd': 'color-mix(in srgb, var(--primary) 88%, var(--brd) 12%)',
    '--ds-segmented-indicator-shadow': 'var(--ds-shadow-2)',
    '--ds-segmented-item-color': 'var(--muted-fg)',
    '--ds-segmented-item-selected-color': 'var(--primary-fg)',
    '--ds-segmented-item-hover-color': 'var(--fg)',
  },
}
export function dsSegmentedRootClass(options: { variant: DsSegmentedVariant, block: boolean, disabled: boolean }): string {
  return [
    rootBaseClass,
    rootVariantClassMap[options.variant],
    options.block ? rootBlockClass : '',
    options.disabled ? 'opacity-70' : '',
  ].filter(Boolean).join(' ')
}
export function dsSegmentedRootStyle(options: { variant: DsSegmentedVariant, size: DsSegmentedSize }): Record<string, string> {
  return {
    ...rootSizeStyles[options.size],
    ...rootVariantStyles[options.variant],
  }
}
export function dsSegmentedIndicatorClass(variant: DsSegmentedVariant): string {
  return [indicatorBaseClass, indicatorVariantClassMap[variant]].join(' ')
}
export function dsSegmentedItemClass(options: {
  variant: DsSegmentedVariant
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
export const dsSegmentedItemLabelClass = itemLabelClass
export const dsSegmentedItemIconClass = itemIconClass
