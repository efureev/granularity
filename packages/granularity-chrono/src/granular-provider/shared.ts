// `id`, `packageBaseUrl` и реестр компонентов провайдера.
//
// Списки под маркерами генерируются `yarn generate:registry` — руками внутри
// них не писать, следующая генерация затрёт.
import {
  defineGranularProvider,
  type GranularComponentDescriptor,
  type GranularProvider,
  resolvePackageBaseUrl,
} from '@feugene/unocss-preset-granular/contract'
// <granularity:components:imports> — блок генерируется `yarn generate:registry`
import { grCalendarConfig } from '../components/GrCalendar/config'
import { grDatePickerConfig } from '../components/GrDatePicker/config'
import { grTimePickerConfig } from '../components/GrTimePicker/config'
// </granularity:components:imports>

/** Идентификатор провайдера — совпадает с именем пакета. */
export const GRANULARITY_CHRONO_PROVIDER_ID = '@feugene/granularity-chrono'

// Не заменять на `new URL('..', import.meta.url)`: Vite и rolldown распознают
// этот литерал и подставляют `data:`-URL, после чего scan-директории пустеют.
const packageBaseUrl = resolvePackageBaseUrl(import.meta.url)

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
 */
export function createGranularityChronoProvider(
  granularityProvider: GranularProvider,
): GranularProvider {
  return defineGranularProvider({
    id: GRANULARITY_CHRONO_PROVIDER_ID,
    contractVersion: 1,
    packageBaseUrl,
    components: Object.values(granularityChronoComponentConfigs),
    dependencies: [granularityProvider],
  })
}
