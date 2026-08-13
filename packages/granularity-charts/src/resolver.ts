import { createGranularResolver } from '@feugene/unplugin-granularity'
import type { ComponentResolver } from 'unplugin-vue-components/types'

import { GRANULARITY_CHARTS_COMPONENTS } from './componentNames'

/**
 * Имя npm-пакета — источника компонентов. Совпадает с `package.json#name`.
 */
export const GRANULARITY_CHARTS_PACKAGE_NAME = '@feugene/granularity-charts'

/**
 * Резолвер `unplugin-vue-components` для `@feugene/granularity-charts`.
 *
 * ⚠️ Ставьте его **перед** жадным `GranularityResolver()` ядра — иначе
 * core-резолвер (совпадает с любым `Gr*`) перехватит `GrChartLine` и
 * импортирует его из несуществующего пути в `@feugene/granularity`.
 *
 * @example
 * ```ts
 * Components({
 *   resolvers: [
 *     GranularityChartsResolver(), // whitelist — раньше…
 *     GranularityResolver(),       // …жадного Gr*-резолвера ядра
 *   ],
 * })
 * ```
 */
export function GranularityChartsResolver(): ComponentResolver {
  return createGranularResolver({
    packageName: GRANULARITY_CHARTS_PACKAGE_NAME,
    components: GRANULARITY_CHARTS_COMPONENTS,
    importStyle: false,
  })
}
