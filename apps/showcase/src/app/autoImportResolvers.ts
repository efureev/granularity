import { GranularityResolver } from '@feugene/unplugin-granularity'
import { GranularityChronoResolver } from '@feugene/granularity-chrono/resolver'
import { GranularityDatepickerResolver } from '@feugene/granularity-datepicker/resolver'

/**
 * Резолверы `unplugin-vue-components` для авто-импорта компонентов дизайн-системы
 * в шаблонах витрины — сразу для трёх пакетов:
 *
 * - `@feugene/granularity` (ядро) — жадный `Gr*`-резолвер;
 * - `@feugene/granularity-datepicker` и `@feugene/granularity-chrono`
 *   (companion) — whitelist-резолверы на общей фабрике `createGranularResolver`.
 *
 * Порядок важен: whitelist-резолверы идут **перед** жадным core-резолвером,
 * иначе он перехватил бы `GrDatePicker` и `GrCalendar` и импортировал бы их из
 * несуществующего пути в ядре.
 *
 * `GrDatePicker` есть в обоих companion-пакетах, и по этому имени выигрывает
 * датапикер — тот, что стоит выше. Демо `chrono` поэтому импортируют свой пикер
 * **явно**: авто-импорт молча подставил бы чужой компонент, а сниппет под
 * превью — это ровно тот код, который читатель копирует к себе. Коллизия уходит
 * вместе со старым пакетом (P2 ТЗ).
 *
 * `importStyle: false` для ядра — витрина собирает CSS сама через UnoCSS
 * (`presetGranularNode` + `granularityProvider`), поэтому per-component
 * `styles.css`-side-effect не нужен (его и нет в dev-dist пакета).
 */
export function granularityAutoImportResolvers() {
  return [
    GranularityDatepickerResolver(),
    GranularityChronoResolver(),
    GranularityResolver({ importStyle: false }),
  ]
}
