import { defineGranumComponent } from '@feugene/granum/contract'

import { grModalSafelist } from './safelist'

export const grModalConfig = defineGranumComponent(import.meta.url, {
  name: 'GrModal',
  /**
   * Высоту слоя задаёт `useModalOverlay` → `modalLayerZIndex`: имя приходит
   * параметром (дефолт живёт в `overlayStack.ts`), а `var()` собирается в
   * рантайме. Статический скан такое не видит.
   */
  dynamicTokens: ['gr-z-modal'],
  safelist: grModalSafelist,
})
