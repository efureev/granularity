import { GranularityResolver } from '@feugene/unplugin-granularity'
import { GranularityDatepickerResolver } from '@feugene/granularity-datepicker/resolver'

/**
 * Резолверы `unplugin-vue-components` для авто-импорта компонентов дизайн-системы
 * в шаблонах витрины — сразу для двух пакетов:
 *
 * - `@feugene/granularity` (ядро) — жадный `Gr*`-резолвер;
 * - `@feugene/granularity-datepicker` (companion) — whitelist-резолвер на общей
 *   фабрике `createGranularResolver`.
 *
 * Порядок важен: whitelist-резолвер датапикера идёт **первым**, иначе жадный
 * core-резолвер перехватил бы `GrDatePicker` и импортировал бы его из
 * несуществующего пути в ядре.
 *
 * `importStyle: false` для ядра — витрина собирает CSS сама через UnoCSS
 * (`presetGranularNode` + `granularityProvider`), поэтому per-component
 * `styles.css`-side-effect не нужен (его и нет в dev-dist пакета).
 */
export function granularityAutoImportResolvers() {
  return [
    GranularityDatepickerResolver(),
    GranularityResolver({ importStyle: false }),
  ]
}
