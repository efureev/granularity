import type { GrComponentSize } from '@feugene/granularity/components/GrConfigProvider'

/** Шкала размеров одна на всю систему — своего кортежа пакет не заводит. */
export type GrCalendarSize = GrComponentSize

/**
 * Классы раскладки. Вид ячеек, заголовка и шапки недели — лист `GrCalendar.vue`
 * по атрибутам (`docs/markup-weight.md` ядра): ячеек в месяце сорок две.
 *
 * Пиксельных литералов здесь нет: кегли, радиусы и длительности — только
 * токенами. Утилиты uno-шкалы (`text-sm`, `rounded-md`) запрещены наравне с
 * литералами — темой они не настраиваются, а выглядят правильно.
 */

export const calendarRootClass
  = 'inline-flex flex-col gap-2 rounded-[var(--gr-radius-md)] bg-[var(--gr-calendar-bg,var(--gr-card))] '
    + 'p-[var(--gr-calendar-padding,0.75rem)] text-[var(--gr-fg)]'

export const calendarHeaderClass = 'flex items-center justify-between gap-2'

export const calendarNavButtonClass
  = 'inline-flex items-center justify-center rounded-[var(--gr-radius-control)] '
    + 'text-[var(--gr-muted-fg)] transition-colors duration-[var(--gr-duration-fast)] ease-[var(--gr-ease-out)] '
    + 'hover:bg-[var(--gr-calendar-hover-bg)] hover:text-[var(--gr-fg)] '
    + 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)] '
    + 'disabled:cursor-not-allowed disabled:bg-[var(--gr-disabled-bg)] disabled:text-[var(--gr-disabled-fg)]'

export const calendarGridClass = 'border-collapse tabular-nums'

export const calendarNavSizes: Record<GrCalendarSize, string> = {
  xs: 'h-6 w-6',
  sm: 'h-7 w-7',
  md: 'h-8 w-8',
  lg: 'h-9 w-9',
}

/**
 * Полоса диапазона рисуется на ячейке таблицы, а не на самом дне: у дня свой
 * радиус, и цепочка скруглённых квадратов полосой не выглядит. Ячейка отдаёт
 * сплошную заливку, а скругление остаётся только на краях.
 *
 * Предпросмотр — полоса от начала до дня под курсором, пока конец не выбран: у
 * него своя заливка, чтобы «ещё не выбрано» не читалось как выбор.
 */
export interface CalendarRangeCellOptions {
  inRange: boolean
  start: boolean
  end: boolean
  preview: boolean
}

export function calendarRangeCellAttrs(options: CalendarRangeCellOptions): Record<string, string | undefined> {
  if (!options.inRange)
    return {}

  return {
    'data-gr-band': options.preview ? 'preview' : 'range',
    'data-gr-start': options.start ? '' : undefined,
    'data-gr-end': options.end ? '' : undefined,
  }
}

export interface CalendarDayAttrsOptions {
  selected: boolean
  /** День соседнего месяца в добивке сетки. */
  outside: boolean
  /** Второй край предпросмотра: день под курсором, ещё не выбранный. */
  previewEnd: boolean
}

/**
 * Атрибуты вида дня: остальное состояние лист читает по ARIA (`aria-current`,
 * `aria-disabled`). Выбор — свой флаг: `aria-selected` у ячейки таблицы стоит и на
 * днях внутри полосы, а залит только выбранный день и края.
 */
export function calendarDayAttrs(options: CalendarDayAttrsOptions): Record<string, string | undefined> {
  return {
    'data-gr-selected': options.selected ? '' : undefined,
    'data-gr-outside': options.outside ? '' : undefined,
    'data-gr-preview': options.previewEnd ? '' : undefined,
  }
}

/** Сетка месяцев, кварталов и лет — стопка рядов: ряд обязан быть элементом с ролью `row`. */
export const calendarPeriodGridClass = 'flex flex-col gap-1'

/** Ряд месяцев и лет: три колонки вместо семи, ячейка шире и ниже. */
export const calendarPeriodRowClass = 'grid grid-cols-3 gap-1'

/** Ряд кварталов — две колонки: три оставили бы одинокую ячейку во втором ряду. */
export const calendarQuarterRowClass = 'grid grid-cols-2 gap-1'
