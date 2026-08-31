import { GranularityResolver } from '@feugene/unplugin-granularity'
import { GranularityChartsResolver } from '@feugene/granularity-charts/resolver'
import { GranularityCodeResolver } from '@feugene/granularity-code/resolver'
import { GranularityChronoResolver } from '@feugene/granularity-chrono/resolver'
import { GranularityDashboardResolver } from '@feugene/granularity-dashboard/resolver'
import { GranularityEditorResolver } from '@feugene/granularity-editor/resolver'
import { GranularityFormsSchemaResolver } from '@feugene/granularity-forms-schema/resolver'
import { GranularityMediaResolver } from '@feugene/granularity-media/resolver'

/**
 * Резолверы `unplugin-vue-components` для авто-импорта компонентов дизайн-системы
 * в шаблонах витрины — сразу для трёх пакетов:
 *
 * - `@feugene/granularity` (ядро) — жадный `Gr*`-резолвер;
 * - `@feugene/granularity-chrono` (companion) — whitelist-резолвер на общей
 *   фабрике `createGranularResolver`;
 * - `@feugene/granularity-charts` (companion) — он же;
 * - `@feugene/granularity-dashboard` (companion) — он же.
 * - `@feugene/granularity-forms-schema` (companion) — он же;
 * - `@feugene/granularity-editor` (companion) — он же;
 * - `@feugene/granularity-media` (companion) — он же;
 * - `@feugene/granularity-code` (companion) — он же.
 *
 * Порядок важен: whitelist-резолверы компаньонов идут **первыми**, иначе жадный
 * core-резолвер перехватил бы `GrCalendar`, `GrChartLine` и остальные и
 * импортировал бы их из несуществующего пути в ядре.
 *
 * `importStyle: false` для ядра — витрина собирает CSS сама через UnoCSS
 * (`presetGranularNode` + `granularityProvider`), поэтому per-component
 * `styles.css`-side-effect не нужен (его и нет в dev-dist пакета).
 */
export function granularityAutoImportResolvers() {
  return [
    GranularityChronoResolver(),
    GranularityChartsResolver(),
    GranularityDashboardResolver(),
    GranularityFormsSchemaResolver(),
    GranularityEditorResolver(),
    GranularityMediaResolver(),
    GranularityCodeResolver(),
    GranularityResolver({ importStyle: false }),
  ]
}
