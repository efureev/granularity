import type { GrCameraCaptureSize } from './grCameraCaptureStyles'

/**
 * Настраиваемые через `GrConfigProvider` пропы.
 *
 * Аугментация реестра идёт по месту объявления — через
 * `@feugene/granularity/composables/useGrComponentConfig`, а не через реэкспорт:
 * иначе слияние отваливается молча.
 */
export interface GrCameraCaptureConfigurableProps {
  size?: GrCameraCaptureSize
}

declare module '@feugene/granularity/composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrCameraCapture?: GrCameraCaptureConfigurableProps
  }
}
