// `id`, `packageBaseUrl` и реестр компонентов провайдера.
//
// Списки под маркерами генерируются `yarn generate:registry` — руками внутри
// них не писать, следующая генерация затрёт.
import {
  defineGranularProvider,
  type GranularComponentDescriptor,
  type GranularProvider,
} from '@feugene/unocss-preset-granular/contract'
// <granularity:components:imports> — блок генерируется `yarn generate:registry`
import { grCalendarConfig } from '../components/GrCalendar/config'
import { grDatePickerConfig } from '../components/GrDatePicker/config'
import { grDateRangePickerConfig } from '../components/GrDateRangePicker/config'
import { grDateTimePickerConfig } from '../components/GrDateTimePicker/config'
import { grRelativeTimeConfig } from '../components/GrRelativeTime/config'
import { grTimePickerConfig } from '../components/GrTimePicker/config'
// </granularity:components:imports>

/** Идентификатор провайдера — совпадает с именем пакета. */
export const GRANULARITY_CHRONO_PROVIDER_ID = '@feugene/granularity-chrono'

/**
 * Реестр компонентов пакета — именованной мапой, а не инлайн-массивом.
 *
 * Именно по нему гейт реестров сверяет состав с файловой системой, а
 * генератор — раскладывает компонент по четырём спискам. Инлайн-массив
 * (как в `granularity-datepicker`) зацепиться было бы не за что.
 */
export const granularityChronoComponentConfigs = {
  // <granularity:components:registry> — блок генерируется `yarn generate:registry`
  GrCalendar: grCalendarConfig,
  GrDatePicker: grDatePickerConfig,
  GrDateRangePicker: grDateRangePickerConfig,
  GrDateTimePicker: grDateTimePickerConfig,
  GrRelativeTime: grRelativeTimeConfig,
  GrTimePicker: grTimePickerConfig,
  // </granularity:components:registry>
} satisfies Record<string, GranularComponentDescriptor>

export type GranularityChronoComponentName = keyof typeof granularityChronoComponentConfigs

/**
 * Собирает granular-provider пакета.
 *
 * Принимает `granularityProvider` снаружи — в зависимости от entry это будет
 * browser- или node-вариант провайдера `@feugene/granularity`. Это важно,
 * чтобы у пресета был ровно один инстанс с данным `id`.
 *
 * `packageBaseUrl` тоже приходит снаружи, из самого entry, и это не церемония:
 * он считается от `import.meta.url`, а этот модуль бандлер волен и вынести в
 * общий чанк, и заинлайнить в entry — то есть положить на разную глубину.
 * Промах на уровень даёт `dist/components/<Name>/`, которых нет, пресет молча
 * пропускает скан, и в CSS остаётся только то, что перечислено в safelist.
 * У entry-файлов место фиксировано конфигом сборки, поэтому считать базу
 * обязаны они.
 */
export function createGranularityChronoProvider(
  granularityProvider: GranularProvider,
  packageBaseUrl: string,
): GranularProvider {
  return defineGranularProvider({
    id: GRANULARITY_CHRONO_PROVIDER_ID,
    contractVersion: 1,
    packageBaseUrl,
    components: Object.values(granularityChronoComponentConfigs),
    dependencies: [granularityProvider],
  })
}
