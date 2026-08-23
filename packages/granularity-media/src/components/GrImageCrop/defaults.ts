import type { GrImageCropSize } from './grImageCropStyles'

/**
 * Настраиваемые через `GrConfigProvider` пропы.
 *
 * Аугментация реестра идёт по месту объявления — через
 * `@feugene/granularity/composables/useGrComponentConfig`, а не через реэкспорт:
 * иначе слияние отваливается молча.
 */
export interface GrImageCropConfigurableProps {
  size?: GrImageCropSize
}

declare module '@feugene/granularity/composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrImageCrop?: GrImageCropConfigurableProps
  }
}
