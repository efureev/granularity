/**
 * Имена компонентов пакета — одним списком без единого импорта.
 *
 * Читает его `resolver.ts` — whitelist авто-импорта. Отдельным файлом именно
 * поэтому: резолвер тянет `unplugin-vue-components`, и списку незачем платить
 * этой зависимостью за каждое своё чтение.
 *
 * Список генерируется `yarn generate:registry` — руками не писать.
 */
export const GRANULARITY_CHRONO_COMPONENTS = [
  // <granularity:components> — блок генерируется `yarn generate:registry`
  'GrCalendar',
  'GrDatePicker',
  'GrDateRangePicker',
  'GrDateTimePicker',
  'GrDuration',
  'GrRelativeTime',
  'GrTimePicker',
  // </granularity:components>
] as const

export type GranularityChronoComponentName = typeof GRANULARITY_CHRONO_COMPONENTS[number]
