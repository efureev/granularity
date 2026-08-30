import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'
import { grDrawerSafelist } from './safelist'

export const grDrawerConfig = defineGranularComponent(import.meta.url, {
  name: 'GrDrawer',
  /**
   * Высоту слоя задаёт `useModalOverlay` → `modalLayerZIndex`: имя приходит
   * параметром (дефолт живёт в `overlayStack.ts`), а `var()` собирается в
   * рантайме. Статический скан такое не видит.
   */
  dynamicTokens: ['gr-z-modal'],
  dependencies: ['GrButton', 'GrIcon'],
  safelist: grDrawerSafelist,
})
