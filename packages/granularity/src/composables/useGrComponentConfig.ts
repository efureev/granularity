/**
 * Чтение дефолтов `GrConfigProvider` — публичной точкой входа.
 *
 * Сами функции живут в `components/GrConfigProvider/context.ts` и оттуда же
 * реэкспортируются барrelем компонента. Отдельный субпуть нужен пакетам-
 * компаньонам: импорт из `components/GrConfigProvider` виден `granular doctor`
 * как ребро графа компонентов, и он справедливо требует объявить зависимость.
 * Объявлять её нельзя — композабл ничего не рендерит, а объявление притащило
 * бы потребителю весь CSS и safelist провайдера. Импорт из `composables/*`
 * ребра не создаёт.
 */
export {
  resolveGrConfig,
  useGrComponentDefaults,
  useGrComponentProp,
  useGrComponentSize,
  useGrConfig,
  useGrThemeAttrs,
} from '../components/GrConfigProvider/context'
export type {
  GrComponentDefaultsRegistry,
  GrConfigContext,
  GrConfigSource,
  GrConfigurableComponent,
  UseGrComponentSizeOptions,
} from '../components/GrConfigProvider/context'
