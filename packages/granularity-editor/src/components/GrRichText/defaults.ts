import type { GrRichTextSize } from './grRichTextStyles'

/**
 * Настраиваемые через `GrConfigProvider` пропы.
 *
 * Аугментация реестра идёт по месту объявления — через
 * `@feugene/granularity/composables/useGrComponentConfig`, а не через реэкспорт:
 * иначе слияние отваливается молча.
 */
export interface GrRichTextConfigurableProps {
  size?: GrRichTextSize
}

declare module '@feugene/granularity/composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrRichText?: GrRichTextConfigurableProps
  }
}
