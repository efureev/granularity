/**
 * Имена компонентов пакета — одним списком без единого импорта.
 *
 * Модуль читают и `resolver.ts` (whitelist авто-импорта), и `vite.config.ts`
 * (раскладка чанков и ассетов). Отдельным файлом именно поэтому: конфиг сборки
 * исполняется до сборки, и тянуть в него `resolver.ts` значило бы грузить
 * `unplugin-vue-components` на этапе чтения конфига, а `granular-provider` —
 * контракт пресета.
 *
 * Список генерируется `yarn generate:registry` — руками не писать.
 */
export const GRANULARITY_CHRONO_COMPONENTS = [
  // <granularity:components> — блок генерируется `yarn generate:registry`
  'GrCalendar',
  'GrDatePicker',
  'GrDateRangePicker',
  'GrDateTimePicker',
  'GrTimePicker',
  // </granularity:components>
] as const

export type GranularityChronoComponentName = typeof GRANULARITY_CHRONO_COMPONENTS[number]
