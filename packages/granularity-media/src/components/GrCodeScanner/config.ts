import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

import { grCodeScannerSafelist } from './grCodeScannerStyles'

/**
 * Кнопки состояния и управления — `GrButton` ядра, и ребро объявлено: пресет
 * подмешивает safelist и CSS только тем компонентам, что попали в селекцию.
 */
export const grCodeScannerConfig = defineGranularComponent(import.meta.url, {
  name: 'GrCodeScanner',
  safelist: grCodeScannerSafelist,
  dependencies: [
    { provider: '@feugene/granularity', components: ['GrButton'] },
  ],
})
