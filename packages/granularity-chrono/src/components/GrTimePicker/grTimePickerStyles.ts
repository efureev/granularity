import type { GrPickerSize } from '../../internal/pickerFieldStyles'

export type GrTimePickerSize = GrPickerSize

/**
 * Классы панели времени.
 *
 * Панель — несколько колонок-листбоксов рядом. Высота колонки вынесена в
 * хук: она задаёт, сколько значений видно разом, и меняет её приложение. Вид
 * значений — лист `GrTimePicker.vue` по атрибутам: в колонке минут их шестьдесят.
 */

export const timePanelClass = 'flex gap-1'

export const timeColumnClass
  = 'relative max-h-[var(--gr-time-picker-column-height,12rem)] w-14 overflow-y-auto '
    + 'scroll-py-1 rounded-[var(--gr-radius-control)] '
    + 'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)]'

export const timeColumnLabelClass
  = 'pb-1 text-center font-500 text-[length:var(--gr-control-text-xs)] leading-[var(--gr-leading-xs)] '
    + 'text-[var(--gr-muted-fg)]'
