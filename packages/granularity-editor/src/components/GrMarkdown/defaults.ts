import type { GrMarkdownDensity, GrMarkdownSize } from './grMarkdownStyles'

/**
 * Пропы `GrMarkdown`, настраиваемые глобально через
 * `<GrConfigProvider :component-defaults="{ GrMarkdown: { … } }">`.
 *
 * Только оформление: источник, политика ссылок и режим HTML задаются на месте —
 * они про конкретный документ, а не про вид приложения.
 *
 * Аугментация идёт по месту объявления — через
 * `@feugene/granularity/composables/useGrComponentConfig`, а не через реэкспорт
 * из корня пакета: иначе слияние отваливается молча.
 */
export interface GrMarkdownConfigurableProps {
  size: GrMarkdownSize
  /**
   * Плотность: `comfortable` — статья, `compact` — комментарий в ленте.
   * Решение сквозное для приложения, поэтому настраивается глобально.
   */
  density: GrMarkdownDensity
}

declare module '@feugene/granularity/composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrMarkdown: GrMarkdownConfigurableProps
  }
}
