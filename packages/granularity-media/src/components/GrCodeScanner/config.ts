import { defineGranumComponent } from '@feugene/granum/contract'

import { grCodeScannerSafelist } from './grCodeScannerStyles'

/**
 * Кнопки состояния и управления — `GrButton` ядра, и ребро объявлено: granum
 * подмешивает safelist и CSS только тем компонентам, что попали в селекцию.
 */
export const grCodeScannerConfig = defineGranumComponent(import.meta.url, {
  name: 'GrCodeScanner',
  safelist: grCodeScannerSafelist,
  dependencies: [
    { provider: '@feugene/granularity', components: ['GrButton'] },
  ],
})
