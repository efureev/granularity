import type { GrVideoPlayerSize } from './grVideoPlayerStyles'

/**
 * Настраиваемые через `GrConfigProvider` пропы.
 *
 * Аугментация реестра идёт по месту объявления — через
 * `@feugene/granularity/composables/useGrComponentConfig`, а не через реэкспорт:
 * иначе слияние отваливается молча.
 */
export interface GrVideoPlayerConfigurableProps {
  size?: GrVideoPlayerSize
}

declare module '@feugene/granularity/composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrVideoPlayer?: GrVideoPlayerConfigurableProps
  }
}
