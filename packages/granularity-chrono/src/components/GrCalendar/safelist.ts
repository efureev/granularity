import { splitClassTokens } from '../../internal/classTokens'

import {
  calendarCellSizes,
  calendarPeriodClass,
  calendarPeriodGridClass,
  calendarPeriodSizes,
  calendarRangeCellClass,
  calendarDayClass,
  calendarGridClass,
  calendarHeaderClass,
  calendarNavButtonClass,
  calendarNavSizes,
  calendarRootClass,
  calendarTitleClass,
  calendarWeekdayClass,
  calendarWeekNumberClass,
} from './grCalendarStyles'

/**
 * Классы из `.ts`-хелпера обязаны быть в safelist.
 *
 * Хелпер уезжает в общий `dist/chunks/`, а пресет сканирует только
 * `dist/components/<Name>/**`. Симптом пропуска узнаваемый: размеры работают,
 * цвета прозрачные, фокус-кольца нет.
 *
 * Ссылки на сами константы, а не их копии строками: копия расходится с
 * оригиналом молча.
 */
const dayVariants = (['xs', 'sm', 'md', 'lg'] as const).flatMap(size => [
  calendarDayClass({ size, inMonth: true, today: false, selected: false, disabled: false }),
  calendarDayClass({ size, inMonth: false, today: false, selected: false, disabled: false }),
  calendarDayClass({ size, inMonth: true, today: true, selected: false, disabled: false }),
  calendarDayClass({ size, inMonth: true, today: false, selected: true, disabled: false }),
  calendarDayClass({ size, inMonth: true, today: false, selected: false, disabled: true }),
])

const rangeVariants = [
  calendarRangeCellClass({ inRange: true, start: false, end: false }),
  calendarRangeCellClass({ inRange: true, start: true, end: false }),
  calendarRangeCellClass({ inRange: true, start: false, end: true }),
]

const periodVariants = (['xs', 'sm', 'md', 'lg'] as const).flatMap(size => [
  calendarPeriodClass({ size, selected: false, current: false, disabled: false }),
  calendarPeriodClass({ size, selected: true, current: false, disabled: false }),
  calendarPeriodClass({ size, selected: false, current: true, disabled: false }),
  calendarPeriodClass({ size, selected: false, current: false, disabled: true }),
])

export const grCalendarSafelist: string[] = [
  ...splitClassTokens(calendarPeriodGridClass),
  ...Object.values(calendarPeriodSizes).flatMap(splitClassTokens),
  ...periodVariants.flatMap(splitClassTokens),
  ...rangeVariants.flatMap(splitClassTokens),
  ...splitClassTokens(calendarRootClass),
  ...splitClassTokens(calendarHeaderClass),
  ...splitClassTokens(calendarTitleClass),
  ...splitClassTokens(calendarNavButtonClass),
  ...splitClassTokens(calendarGridClass),
  ...splitClassTokens(calendarWeekdayClass),
  ...splitClassTokens(calendarWeekNumberClass),
  ...Object.values(calendarCellSizes).flatMap(splitClassTokens),
  ...Object.values(calendarNavSizes).flatMap(splitClassTokens),
  ...dayVariants.flatMap(splitClassTokens),
]
