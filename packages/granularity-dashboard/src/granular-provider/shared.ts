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
import { grDashboardConfig } from '../components/GrDashboard/config'
import { grDashboardItemConfig } from '../components/GrDashboardItem/config'
import { grDashboardPaletteConfig } from '../components/GrDashboardPalette/config'
import { grDashboardToolbarConfig } from '../components/GrDashboardToolbar/config'
// </granularity:components:imports>

/** Идентификатор провайдера — совпадает с именем пакета. */
export const GRANULARITY_DASHBOARD_PROVIDER_ID = '@feugene/granularity-dashboard'

/**
 * Реестр компонентов пакета — именованной мапой, а не инлайн-массивом: по нему
 * строятся списки на стороне потребителя (цели e2e витрины, например), и там
 * нужно имя, а не позиция.
 */
export const granularityDashboardComponentConfigs = {
  // <granularity:components:registry> — блок генерируется `yarn generate:registry`
  GrDashboard: grDashboardConfig,
  GrDashboardItem: grDashboardItemConfig,
  GrDashboardPalette: grDashboardPaletteConfig,
  GrDashboardToolbar: grDashboardToolbarConfig,
  // </granularity:components:registry>
} satisfies Record<string, GranularComponentDescriptor>

export type GranularityDashboardComponentName = keyof typeof granularityDashboardComponentConfigs

/**
 * Собирает granular-provider пакета.
 *
 * Принимает `granularityProvider` снаружи — в зависимости от entry это будет
 * browser- или node-вариант провайдера `@feugene/granularity`: у пресета должен
 * быть ровно один инстанс с данным `id`.
 *
 * `packageBaseUrl` тоже приходит снаружи, из самого entry: считать его здесь
 * нельзя, потому что `import.meta.url` этого модуля после сборки указывает в
 * общий чанк, а не в корень `dist`.
 */
export function createGranularityDashboardProvider(
  granularityProvider: GranularProvider,
  packageBaseUrl: string,
): GranularProvider {
  return defineGranularProvider({
    id: GRANULARITY_DASHBOARD_PROVIDER_ID,
    contractVersion: 1,
    packageBaseUrl,
    components: Object.values(granularityDashboardComponentConfigs),
    dependencies: [granularityProvider],
  })
}
