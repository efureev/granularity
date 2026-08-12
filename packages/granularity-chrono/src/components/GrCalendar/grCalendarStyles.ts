import type { GrComponentSize } from '@feugene/granularity/components/GrConfigProvider'

/** Шкала размеров одна на всю систему — своего кортежа пакет не заводит. */
export type GrCalendarSize = GrComponentSize

/**
 * Классы сетки.
 *
 * Пиксельных литералов здесь нет: кегли, радиусы и длительности — только
 * токенами. Утилиты uno-шкалы (`text-sm`, `rounded-md`) запрещены наравне с
 * литералами — темой они не настраиваются, а выглядят правильно.
 */

export const calendarRootClass
  = 'inline-flex flex-col gap-2 rounded-[var(--gr-radius-md)] bg-[var(--gr-calendar-bg,var(--gr-card))] '
    + 'p-[var(--gr-calendar-padding,0.75rem)] text-[var(--gr-fg)]'

export const calendarHeaderClass = 'flex items-center justify-between gap-2'

export const calendarTitleClass
  = 'font-600 text-[length:var(--gr-control-text-md)] leading-[var(--gr-leading-sm)]'

export const calendarNavButtonClass
  = 'inline-flex items-center justify-center rounded-[var(--gr-radius-control)] '
    + 'text-[var(--gr-muted-fg)] transition-colors duration-[var(--gr-duration-fast)] ease-[var(--gr-ease-out)] '
    + 'hover:bg-[var(--gr-muted)] hover:text-[var(--gr-fg)] '
    + 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)] '
    + 'disabled:cursor-not-allowed disabled:bg-[var(--gr-disabled-bg)] disabled:text-[var(--gr-disabled-fg)]'

export const calendarGridClass = 'border-collapse tabular-nums'

export const calendarWeekdayClass
  = 'text-center font-500 text-[length:var(--gr-control-text-xs)] leading-[var(--gr-leading-xs)] '
    + 'text-[var(--gr-muted-fg)]'

export const calendarWeekNumberClass
  = 'pr-1 text-right align-middle text-[length:var(--gr-control-text-xs)] leading-[var(--gr-leading-xs)] '
    + 'text-[var(--gr-muted-fg)]'

/** Размер ячейки — не меньше 24 CSS-px по WCAG 2.2 «Target Size (Minimum)». */
export const calendarCellSizes: Record<GrCalendarSize, string> = {
  xs: 'h-7 w-7 text-[length:var(--gr-control-text-xs)]',
  sm: 'h-8 w-8 text-[length:var(--gr-control-text-sm)]',
  md: 'h-9 w-9 text-[length:var(--gr-control-text-md)]',
  lg: 'h-10 w-10 text-[length:var(--gr-control-text-lg)]',
}

export const calendarNavSizes: Record<GrCalendarSize, string> = {
  xs: 'h-6 w-6',
  sm: 'h-7 w-7',
  md: 'h-8 w-8',
  lg: 'h-9 w-9',
}

export interface CalendarDayClassOptions {
  size: GrCalendarSize
  inMonth: boolean
  today: boolean
  selected: boolean
  disabled: boolean
}

/**
 * Классы дня.
 *
 * Состояния читаются не только цветом: «сегодня» несёт обводку, выбранный —
 * заливку с проверенным контрастом. Требование WCAG 1.4.1, и в тёмной теме
 * его надо смотреть отдельно.
 */
export function calendarDayClass(options: CalendarDayClassOptions): string {
  const parts = [
    'inline-flex items-center justify-center rounded-[var(--gr-radius-control)]',
    'transition-colors duration-[var(--gr-duration-fast)] ease-[var(--gr-ease-out)]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)]',
    calendarCellSizes[options.size],
  ]

  if (options.disabled)
    parts.push('cursor-not-allowed text-[var(--gr-disabled-fg)]')
  else if (options.selected)
    parts.push('bg-[var(--gr-calendar-selected-bg,var(--gr-primary))] text-[var(--gr-calendar-selected-fg,var(--gr-primary-fg))]')
  else if (options.inMonth)
    parts.push('cursor-pointer text-[var(--gr-fg)] hover:bg-[var(--gr-calendar-hover-bg,var(--gr-muted))]')
  else
    parts.push('cursor-pointer text-[var(--gr-calendar-outside-fg,var(--gr-muted-fg))] hover:bg-[var(--gr-calendar-hover-bg,var(--gr-muted))]')

  // Обводка «сегодня» рисуется поверх любого состояния, кроме выбранного:
  // у выбранного дня заливка сама достаточно заметна.
  if (options.today && !options.selected)
    parts.push('ring-1 ring-[var(--gr-calendar-today-ring,var(--gr-primary))] ring-inset')

  return parts.join(' ')
}
