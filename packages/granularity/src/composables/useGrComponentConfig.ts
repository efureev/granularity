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
  GrConfigContext,
  GrConfigSource,
  GrConfigurableComponent,
  UseGrComponentSizeOptions,
} from '../components/GrConfigProvider/context'

/**
 * Открытый реестр компонентов, у которых есть настраиваемые через конфиг пропы.
 *
 * Объявление живёт здесь, а не в `GrConfigProvider/context`, потому что это
 * **точка расширения**: компонент дополняет реестр из своей папки через
 * declaration merging, и то же самое обязан уметь companion-пакет. Дополнять
 * можно только тот модуль, который тип объявляет; через реэкспорт-баррель
 * слияние работает лишь до первой чужой аугментации, а дальше молча
 * отваливается — типы расходятся с рантаймом, ошибки нет.
 *
 * ```ts
 * // GrButton/defaults.ts
 * declare module '../../composables/useGrComponentConfig' {
 *   interface GrComponentDefaultsRegistry {
 *     GrButton: GrButtonConfigurableProps
 *   }
 * }
 * ```
 *
 * Companion-пакет пишет тот же блок с публичным именем модуля
 * `@feugene/granularity/composables/useGrComponentConfig`.
 *
 * Реестр пуст по умолчанию и состоит ровно из тех компонентов, которые попали
 * в граф типов потребителя: импортировали только `GrButton` — в
 * `componentDefaults` типизирована только кнопка.
 */
export interface GrComponentDefaultsRegistry {}
