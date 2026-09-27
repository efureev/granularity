// `id`, диалект движка и реестр компонентов провайдера.
//
// Списки под маркерами генерируются `yarn generate:registry` — руками внутри
// них не писать, следующая генерация затрёт.
import {
  defineGranumProvider,
  type GranumComponentDescriptor,
  type GranumProvider,
} from '@feugene/granum/contract'
// <granularity:components:imports> — блок генерируется `yarn generate:registry`
import { grCalendarConfig } from '../components/GrCalendar/config'
import { grDatePickerConfig } from '../components/GrDatePicker/config'
import { grDateRangePickerConfig } from '../components/GrDateRangePicker/config'
import { grDateTimePickerConfig } from '../components/GrDateTimePicker/config'
import { grDurationConfig } from '../components/GrDuration/config'
import { grRelativeTimeConfig } from '../components/GrRelativeTime/config'
import { grTimePickerConfig } from '../components/GrTimePicker/config'
// </granularity:components:imports>

/** Идентификатор провайдера — совпадает с именем пакета. */
export const GRANULARITY_CHRONO_PROVIDER_ID = '@feugene/granularity-chrono'

/** Донор: компоненты пакета опираются на компоненты ядра. */
const GRANULARITY_CORE_PROVIDER_ID = '@feugene/granularity'

/**
 * Словарь утилит, против которого написаны классы компонентов, — тот же, что у
 * ядра. Сборка сверит объявление с диалектом движка, которым её запустили, и не
 * даст записать в манифест чужой словарь.
 */
export const GRANULARITY_CHRONO_ENGINE_DIALECT = 'unocss/preset-wind3+granum@66'

/**
 * Реестр компонентов пакета — именованной мапой, а не инлайн-массивом.
 *
 * Именно по нему гейт реестров сверяет состав с файловой системой, а
 * генератор — раскладывает компонент по спискам. Инлайн-массиву зацепиться было
 * бы не за что.
 */
export const granularityChronoComponentConfigs = {
  // <granularity:components:registry> — блок генерируется `yarn generate:registry`
  GrCalendar: grCalendarConfig,
  GrDatePicker: grDatePickerConfig,
  GrDateRangePicker: grDateRangePickerConfig,
  GrDateTimePicker: grDateTimePickerConfig,
  GrDuration: grDurationConfig,
  GrRelativeTime: grRelativeTimeConfig,
  GrTimePicker: grTimePickerConfig,
  // </granularity:components:registry>
} satisfies Record<string, GranumComponentDescriptor>

export type GranularityChronoComponentName = keyof typeof granularityChronoComponentConfigs

/**
 * Собирает провайдера пакета.
 *
 * Донор объявлен строкой, а не инстансом: приложение подключает оба пакета по
 * имени, и каждый приезжает своим манифестом. Инстанс в `dependencies` втянул
 * бы ядро в граф объектной формой — то есть заставил бы приложение сканировать
 * его `dist` вместо того, чтобы прочитать готовый манифест (C-4).
 *
 * База раскладки здесь не нужна вовсе: у манифестной формы она равна директории
 * манифеста, и считать её от `import.meta.url` больше незачем.
 */
export function createGranularityChronoProvider(): GranumProvider {
  return defineGranumProvider({
    id: GRANULARITY_CHRONO_PROVIDER_ID,
    contractVersion: 1,
    engine: { dialect: GRANULARITY_CHRONO_ENGINE_DIALECT },
    components: Object.values(granularityChronoComponentConfigs),
    dependencies: [GRANULARITY_CORE_PROVIDER_ID],
  })
}
