// `id`, `packageBaseUrl` и список компонентов провайдера.
import {
  defineGranularProvider,
  type GranularProvider,
  resolvePackageBaseUrl,
} from '@feugene/unocss-preset-granular/contract'

import { grDateTimePickerConfig } from '../components/GrDateTimePicker/config'
import { grDatePickerConfig } from '../components/GrDatePicker/config'
import { grTimePickerConfig } from '../components/GrTimePicker/config'
import { grDateRangePickerConfig } from '../components/GrDateRangePicker/config'

/** Идентификатор провайдера — совпадает с именем пакета. */
export const GRANULARITY_DATEPICKER_PROVIDER_ID = '@feugene/granularity-datepicker'

// Не заменять на `new URL('..', import.meta.url)`: Vite и rolldown распознают
// этот литерал и подставляют `data:`-URL, после чего scan-директории пустеют.
const packageBaseUrl = resolvePackageBaseUrl(import.meta.url)

/**
 * Собирает granular-provider пакета `@feugene/granularity-datepicker`.
 *
 * Принимает `granularityProvider` снаружи — в зависимости от entry это будет
 * browser- или node-вариант провайдера `@feugene/granularity`. Это важно,
 * чтобы у пресета `presetGranularNode` был ровно один инстанс с данным `id`.
 */
export function createGranularityDatepickerProvider(
  granularityProvider: GranularProvider,
): GranularProvider {
  return defineGranularProvider({
    id: GRANULARITY_DATEPICKER_PROVIDER_ID,
    contractVersion: 1,
    packageBaseUrl,
    components: [
      grDateTimePickerConfig,
      grDatePickerConfig,
      grTimePickerConfig,
      grDateRangePickerConfig,
    ],
    dependencies: [granularityProvider],
  })
}
