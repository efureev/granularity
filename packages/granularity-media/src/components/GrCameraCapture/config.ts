import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

import { grCameraCaptureSafelist } from './grCameraCaptureStyles'

/**
 * Кнопки состояния и съёмки — `GrButton` ядра, и ребро объявлено: пресет
 * подмешивает safelist и CSS только тем компонентам, что попали в селекцию, и
 * без графа потребитель, выбравший одну камеру, получил бы кнопки без фона.
 */
export const grCameraCaptureConfig = defineGranularComponent(import.meta.url, {
  name: 'GrCameraCapture',
  safelist: grCameraCaptureSafelist,
  dependencies: [
    { provider: '@feugene/granularity', components: ['GrButton'] },
  ],
})
