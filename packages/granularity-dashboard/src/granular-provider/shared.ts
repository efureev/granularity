// `id` и реестр компонентов провайдера.
//
// Списки под маркерами генерируются `yarn generate:registry` — руками внутри
// них не писать, следующая генерация затрёт.
import {
  defineGranumProvider,
  type GranumComponentDescriptor,
  type GranumProvider,
} from '@feugene/granum/contract'
// <granularity:components:imports> — блок генерируется `yarn generate:registry`
import { grDashboardConfig } from '../components/GrDashboard/config'
import { grDashboardItemConfig } from '../components/GrDashboardItem/config'
import { grDashboardItemSettingsConfig } from '../components/GrDashboardItemSettings/config'
import { grDashboardPaletteConfig } from '../components/GrDashboardPalette/config'
import { grDashboardToolbarConfig } from '../components/GrDashboardToolbar/config'
// </granularity:components:imports>

/** Идентификатор провайдера — совпадает с именем пакета. */
export const GRANULARITY_DASHBOARD_PROVIDER_ID = '@feugene/granularity-dashboard'

/** Донор: компоненты пакета опираются на компоненты ядра. */
const GRANULARITY_CORE_PROVIDER_ID = '@feugene/granularity'

/**
 * Словарь утилит, против которого написаны классы компонентов, — тот же, что у
 * ядра. Сборка сверит объявление с диалектом движка, которым её запустили, и не
 * даст записать в манифест чужой словарь.
 */
export const GRANULARITY_DASHBOARD_ENGINE_DIALECT = 'unocss/preset-wind3+granum@66'

/**
 * Реестр компонентов пакета — именованной мапой, а не инлайн-массивом: по нему
 * строятся списки на стороне потребителя (цели e2e витрины, например), и там
 * нужно имя, а не позиция.
 */
export const granularityDashboardComponentConfigs = {
  // <granularity:components:registry> — блок генерируется `yarn generate:registry`
  GrDashboard: grDashboardConfig,
  GrDashboardItem: grDashboardItemConfig,
  GrDashboardItemSettings: grDashboardItemSettingsConfig,
  GrDashboardPalette: grDashboardPaletteConfig,
  GrDashboardToolbar: grDashboardToolbarConfig,
  // </granularity:components:registry>
} satisfies Record<string, GranumComponentDescriptor>

export type GranularityDashboardComponentName = keyof typeof granularityDashboardComponentConfigs

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
export function createGranularityDashboardProvider(): GranumProvider {
  return defineGranumProvider({
    id: GRANULARITY_DASHBOARD_PROVIDER_ID,
    contractVersion: 1,
    engine: { dialect: GRANULARITY_DASHBOARD_ENGINE_DIALECT },
    components: Object.values(granularityDashboardComponentConfigs),
    dependencies: [GRANULARITY_CORE_PROVIDER_ID],
  })
}
