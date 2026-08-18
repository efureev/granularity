import type { GrPickerSize } from '../../internal/pickerFieldStyles'

export type GrTimePickerSize = GrPickerSize

/**
 * Классы панели времени.
 *
 * Панель — несколько колонок-листбоксов рядом. Высота колонки вынесена в
 * токен: она задаёт, сколько значений видно разом, и это решение темы, а не
 * компонента.
 */

export const timePanelClass = 'flex gap-1'

export const timeColumnClass
  = 'max-h-[var(--gr-time-picker-column-height,12rem)] w-14 overflow-y-auto '
    + 'scroll-py-1 rounded-[var(--gr-radius-control)] '
    + 'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)]'

export const timeColumnLabelClass
  = 'pb-1 text-center font-500 text-[length:var(--gr-control-text-xs)] leading-[var(--gr-leading-xs)] '
    + 'text-[var(--gr-muted-fg)]'

export const timeOptionSizes: Record<GrTimePickerSize, string> = {
  xs: 'h-6 text-[length:var(--gr-control-text-xs)] leading-[var(--gr-control-leading-xs)]',
  sm: 'h-7 text-[length:var(--gr-control-text-sm)] leading-[var(--gr-control-leading-sm)]',
  md: 'h-8 text-[length:var(--gr-control-text-md)] leading-[var(--gr-control-leading-md)]',
  lg: 'h-9 text-[length:var(--gr-control-text-lg)] leading-[var(--gr-control-leading-lg)]',
}

export interface TimeOptionClassOptions {
  size: GrTimePickerSize
  selected: boolean
  /** Элемент под `aria-activedescendant` — курсор клавиатуры, а не выбор. */
  active: boolean
  disabled: boolean
}

/**
 * Состояния опции читаются не только цветом: выбранная несёт заливку, а
 * клавиатурный курсор — кольцо. Иначе при выборе, совпавшем с курсором, они
 * визуально сливались бы в одно.
 */
export function timeOptionClass(options: TimeOptionClassOptions): string {
  const parts = [
    'flex w-full cursor-pointer items-center justify-center tabular-nums',
    'rounded-[var(--gr-radius-control)]',
    'transition-colors duration-[var(--gr-duration-fast)] ease-[var(--gr-ease-out)]',
    timeOptionSizes[options.size],
  ]

  if (options.disabled)
    parts.push('cursor-not-allowed text-[var(--gr-disabled-fg)]')
  else if (options.selected)
    parts.push('bg-[var(--gr-time-picker-selected-bg,var(--gr-primary))] text-[var(--gr-time-picker-selected-fg,var(--gr-primary-fg))]')
  else
    parts.push('text-[var(--gr-fg)] hover:bg-[var(--gr-time-picker-hover-bg,var(--gr-muted))]')

  if (options.active && !options.disabled)
    parts.push('ring-1 ring-[var(--gr-time-picker-active-ring,var(--gr-ring))] ring-inset')

  return parts.join(' ')
}
