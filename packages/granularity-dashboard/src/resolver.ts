import { createGranularResolver } from '@feugene/unplugin-granularity'
import type { ComponentResolver } from 'unplugin-vue-components/types'

import { GRANULARITY_DASHBOARD_COMPONENTS } from './componentNames'

/** Имя npm-пакета — источника компонентов. Совпадает с `package.json#name`. */
export const GRANULARITY_DASHBOARD_PACKAGE_NAME = '@feugene/granularity-dashboard'

/**
 * Резолвер `unplugin-vue-components` для `@feugene/granularity-dashboard` — явный список его
 * компонентов.
 *
 * Новому конфигу он не нужен: `GranularityResolver()` из
 * `@feugene/unplugin-granularity` `>=1.1.0` находит пакет в `package.json`
 * приложения и резолвит ядро вместе со спутниками, в любом порядке. Этот
 * резолвер остаётся для уже написанных конфигов и работает рядом с единым.
 *
 * `importStyle: false` — CSS компонента доставляет granum из манифеста пакета.
 */
export function GranularityDashboardResolver(): ComponentResolver {
  return createGranularResolver({
    packageName: GRANULARITY_DASHBOARD_PACKAGE_NAME,
    components: GRANULARITY_DASHBOARD_COMPONENTS,
    importStyle: false,
  })
}
