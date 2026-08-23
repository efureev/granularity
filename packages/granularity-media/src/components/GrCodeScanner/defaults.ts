import type { GrCodeScannerSize } from './grCodeScannerStyles'

/**
 * Настраиваемые через `GrConfigProvider` пропы.
 *
 * Аугментация реестра идёт по месту объявления — через
 * `@feugene/granularity/composables/useGrComponentConfig`, а не через реэкспорт:
 * иначе слияние отваливается молча.
 */
export interface GrCodeScannerConfigurableProps {
  size?: GrCodeScannerSize
}

declare module '@feugene/granularity/composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrCodeScanner?: GrCodeScannerConfigurableProps
  }
}
