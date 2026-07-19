import { createGranularResolver } from '@feugene/unplugin-granularity'
import type { ComponentResolver } from 'unplugin-vue-components/types'

/**
 * Имя npm-пакета — источника компонентов. Совпадает с `package.json#name`.
 */
export const GRANULARITY_DATEPICKER_PACKAGE_NAME = '@feugene/granularity-datepicker'

/**
 * Компоненты, публикуемые пакетом. Резолвер использует whitelist (а не жадный
 * `Gr*`-префикс), потому что имена пересекаются с core-резолвером
 * `@feugene/granularity`.
 */
export const GRANULARITY_DATEPICKER_COMPONENTS = [
  'GrDateTimePicker',
  'GrDatePicker',
  'GrTimePicker',
  'GrDateRangePicker',
] as const

/**
 * Резолвер `unplugin-vue-components` для `@feugene/granularity-datepicker`.
 *
 * Построен на общей фабрике `createGranularResolver` из
 * `@feugene/unplugin-granularity`. Резолвит четыре компонента пакета на их
 * гранулярные subpath-экспорты. CSS у пакета инлайнится в JS-чанк
 * (`libInjectCss` + `sideEffects: ["**\/*.css"]`), поэтому отдельный
 * `styles.css`-side-effect не нужен (`importStyle: false`).
 *
 * ⚠️ Ставьте этот резолвер **перед** жадным `GranularityResolver()` ядра —
 * иначе core-резолвер (совпадает с любым `Gr*`) перехватит `GrDatePicker`
 * и импортирует его из несуществующего пути в `@feugene/granularity`.
 *
 * @example
 * ```ts
 * // vite.config.ts
 * import Components from 'unplugin-vue-components/vite'
 * import { GranularityResolver } from '@feugene/unplugin-granularity'
 * import { GranularityDatepickerResolver } from '@feugene/granularity-datepicker/resolver'
 *
 * export default defineConfig({
 *   plugins: [
 *     Components({
 *       resolvers: [
 *         GranularityDatepickerResolver(), // whitelist — раньше…
 *         GranularityResolver(),           // …жадного Gr*-резолвера ядра
 *       ],
 *     }),
 *   ],
 * })
 * ```
 */
export function GranularityDatepickerResolver(): ComponentResolver {
  return createGranularResolver({
    packageName: GRANULARITY_DATEPICKER_PACKAGE_NAME,
    components: GRANULARITY_DATEPICKER_COMPONENTS,
    importStyle: false,
  })
}
