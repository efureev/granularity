import { createGranularResolver } from '@feugene/unplugin-granularity'
import type { ComponentResolver } from 'unplugin-vue-components/types'

import { GRANULARITY_EDITOR_COMPONENTS } from './componentNames'

/**
 * Имя npm-пакета — источника компонентов. Совпадает с `package.json#name`.
 */
export const GRANULARITY_EDITOR_PACKAGE_NAME = '@feugene/granularity-editor'

/**
 * Резолвер `unplugin-vue-components` для `@feugene/granularity-editor`.
 *
 * Построен на общей фабрике `createGranularResolver` из
 * `@feugene/unplugin-granularity`. Резолвит компоненты пакета на их
 * гранулярные subpath-экспорты. CSS компонента импортируется его же чанком
 * (`libInjectCss` + `sideEffects: ["**\/*.css"]`), поэтому отдельный
 * `styles.css`-side-effect не нужен (`importStyle: false`).
 *
 * ⚠️ Ставьте этот резолвер **перед** жадным `GranularityResolver()` ядра —
 * иначе core-резолвер (совпадает с любым `Gr*`) перехватит `GrRichText`
 * и импортирует его из несуществующего пути в `@feugene/granularity`.
 *
 * @example
 * ```ts
 * // vite.config.ts
 * import Components from 'unplugin-vue-components/vite'
 * import { GranularityResolver } from '@feugene/unplugin-granularity'
 * import { GranularityEditorResolver } from '@feugene/granularity-editor/resolver'
 *
 * export default defineConfig({
 *   plugins: [
 *     Components({
 *       resolvers: [
 *         GranularityEditorResolver(), // whitelist — раньше…
 *         GranularityResolver(),       // …жадного Gr*-резолвера ядра
 *       ],
 *     }),
 *   ],
 * })
 * ```
 */
export function GranularityEditorResolver(): ComponentResolver {
  return createGranularResolver({
    packageName: GRANULARITY_EDITOR_PACKAGE_NAME,
    components: GRANULARITY_EDITOR_COMPONENTS,
    importStyle: false,
  })
}
