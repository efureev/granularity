import { defineGranumComponent } from '@feugene/granum/contract'

import { grImageViewerSafelist } from './safelist'

export const grImageViewerConfig = defineGranumComponent(import.meta.url, {
  name: 'GrImageViewer',
  /**
   * Высоту слоя задаёт `useModalOverlay` → `modalLayerZIndex`: имя приходит
   * параметром (дефолт живёт в `overlayStack.ts`), а `var()` собирается в
   * рантайме. Статический скан такое не видит.
   */
  dynamicTokens: ['gr-z-modal'],
  dependencies: ['GrIcon'],
  safelist: grImageViewerSafelist,
})
