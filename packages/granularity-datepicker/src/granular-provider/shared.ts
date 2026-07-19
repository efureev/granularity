// Общий код browser- и node-entry granular-provider'а `@feugene/granularity-datepicker`.
//
// Оба entry (`./index.ts`, `./node.ts`) отличаются только инстансом
// `granularityProvider`, который попадает в `dependencies`: browser-entry
// использует browser-вариант из `@feugene/granularity/granular-provider`,
// node-entry — FS-aware вариант из `.../granular-provider/node`. Всё
// остальное (id, `packageBaseUrl`, список компонентов) идентично и живёт
// здесь, в фабрике `createGranularityDatepickerProvider`.
import {
  defineGranularProvider,
  type GranularProvider,
} from '@feugene/unocss-preset-granular/contract'

import { grDateTimePickerConfig } from '../components/GrDateTimePicker/config'
import { grDatePickerConfig } from '../components/GrDatePicker/config'
import { grTimePickerConfig } from '../components/GrTimePicker/config'
import { grDateRangePickerConfig } from '../components/GrDateRangePicker/config'

/** Идентификатор провайдера — совпадает с именем пакета. */
export const GRANULARITY_DATEPICKER_PROVIDER_ID = '@feugene/granularity-datepicker'

// runtime-concat: литерал `new URL('..', import.meta.url)` rolldown заменяет
// на `data:`-URL, поэтому собираем корень пакета из `import.meta.url` вручную
// (отрезая два последних сегмента: имя файла и каталог `granular-provider/`).
const packageBaseUrl = `${import.meta.url.slice(
  0,
  import.meta.url.lastIndexOf('/', import.meta.url.lastIndexOf('/') - 1) + 1,
)}`

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
