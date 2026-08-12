import { GranularityResolver } from '@feugene/unplugin-granularity'
import { GranularityChronoResolver } from '@feugene/granularity-chrono/resolver'

/**
 * Резолверы `unplugin-vue-components` для авто-импорта компонентов дизайн-системы
 * в шаблонах витрины — сразу для двух пакетов:
 *
 * - `@feugene/granularity` (ядро) — жадный `Gr*`-резолвер;
 * - `@feugene/granularity-chrono` (companion) — whitelist-резолвер на общей
 *   фабрике `createGranularResolver`.
 *
 * Порядок важен: whitelist-резолвер компаньона идёт **первым**, иначе жадный
 * core-резолвер перехватил бы `GrCalendar` и пикеры и импортировал бы их из
 * несуществующего пути в ядре.
 *
 * `importStyle: false` для ядра — витрина собирает CSS сама через UnoCSS
 * (`presetGranularNode` + `granularityProvider`), поэтому per-component
 * `styles.css`-side-effect не нужен (его и нет в dev-dist пакета).
 */
export function granularityAutoImportResolvers() {
  return [
    GranularityChronoResolver(),
    GranularityResolver({ importStyle: false }),
  ]
}
