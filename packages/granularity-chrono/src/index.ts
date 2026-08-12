// <granularity:components> — блок генерируется `yarn generate:registry`
export * from './components/GrCalendar'
// </granularity:components>

// Арифметика дат и времени. Публична намеренно: потребитель, которому нужно
// «плюс месяц» или «попадает ли в диапазон», не должен ради этого ставить
// date-библиотеку рядом с пакетом, у которого всё это уже есть.
export type { IsoWeekday, PlainDate } from './chrono/plainDate'
export {
  addDays,
  addMonths,
  addYears,
  clampPlainDate,
  comparePlainDates,
  daysInMonth,
  differenceInDays,
  endOfMonth,
  fromEpochDay,
  isLeapYear,
  isoWeekday,
  isoWeekNumber,
  isPlainDateWithin,
  isSameMonth,
  isSamePlainDate,
  plainDate,
  plainDateKey,
  startOfMonth,
  toEpochDay,
} from './chrono/plainDate'

export type { DayPeriod, PlainTime } from './chrono/plainTime'
export {
  addHours,
  addMinutes,
  addSeconds,
  clampPlainTime,
  comparePlainTimes,
  floorToStep,
  fromSecondsOfDay,
  fromTwelveHour,
  isPlainTimeWithin,
  isSamePlainTime,
  plainTime,
  SECONDS_IN_DAY,
  SECONDS_IN_HOUR,
  SECONDS_IN_MINUTE,
  toSecondsOfDay,
  toTwelveHour,
} from './chrono/plainTime'

// Сетка месяца — чистая функция; мемоизацию даёт `computed` компонента.
export type {
  BuildCalendarGridOptions,
  CalendarCell,
  CalendarGrid,
  CalendarWeek,
  DisabledDatesInput,
} from './chrono/calendarGrid'
export { buildCalendarGrid, createDisabledPredicate } from './chrono/calendarGrid'

// Всё локале-зависимое — из `Intl`, а не из словарей пакета.
export type { NameWidth } from './chrono/chronoFormat'
export {
  formatMonthTitle,
  formatPlainDate,
  formatPlainTime,
  localeFirstDayOfWeek,
  localeUsesTwelveHour,
  monthNames,
  resetChronoFormatCache,
  weekdayNames,
} from './chrono/chronoFormat'

// Граница с `Date`: разбор, сборка и адаптеры сериализации.
export type {
  GrChronoAdapter,
  GrChronoAdapterName,
  GrChronoRangeValue,
  GrChronoValue,
} from './chrono/chronoModel'
export {
  dateAdapter,
  fromPlainParts,
  isoDateAdapter,
  isoDateTimeAdapter,
  isValidDate,
  resolveChronoAdapter,
  timestampAdapter,
  toPlainDate,
  toPlainTime,
} from './chrono/chronoModel'

// Строки интерфейса пакета. Названий месяцев и дней здесь нет — их даёт `Intl`.
export type { GrChronoLocale } from './i18n'
export { grChronoMessages } from './i18n'
