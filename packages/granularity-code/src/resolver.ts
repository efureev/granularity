import { createGranularResolver } from '@feugene/unplugin-granularity'
import type { ComponentResolver } from 'unplugin-vue-components/types'

import { GRANULARITY_CODE_COMPONENTS } from './componentNames'

/** Имя npm-пакета — источника компонентов. Совпадает с `package.json#name`. */
export const GRANULARITY_CODE_PACKAGE_NAME = '@feugene/granularity-code'

/**
 * Резолвер `unplugin-vue-components` для `@feugene/granularity-code`.
 *
 * CSS компонента импортируется его же чанком (`libInjectCss` +
 * `sideEffects: ["**\/*.css"]`), поэтому отдельный side-effect не нужен
 * (`importStyle: false`).
 *
 * ⚠️ Ставьте этот резолвер **перед** жадным `GranularityResolver()` ядра —
 * иначе core-резолвер (совпадает с любым `Gr*`) перехватит `GrCodeBlock`
 * и импортирует его из несуществующего пути в `@feugene/granularity`.
 *
 * @example
 * ```ts
 * // vite.config.ts
 * import Components from 'unplugin-vue-components/vite'
 * import { GranularityResolver } from '@feugene/unplugin-granularity'
 * import { GranularityCodeResolver } from '@feugene/granularity-code/resolver'
 *
 * export default defineConfig({
 *   plugins: [
 *     Components({
 *       resolvers: [
 *         GranularityCodeResolver(), // whitelist — раньше…
 *         GranularityResolver(),     // …жадного Gr*-резолвера ядра
 *       ],
 *     }),
 *   ],
 * })
 * ```
 */
export function GranularityCodeResolver(): ComponentResolver {
  return createGranularResolver({
    packageName: GRANULARITY_CODE_PACKAGE_NAME,
    components: GRANULARITY_CODE_COMPONENTS,
    importStyle: false,
  })
}
