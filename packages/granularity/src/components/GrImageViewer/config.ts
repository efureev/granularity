import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

import { grImageViewerSafelist } from './safelist'

export const grImageViewerConfig = defineGranularComponent(import.meta.url, {
  name: 'GrImageViewer',
  /**
   * Высоту слоя задаёт `useModalOverlay` → `modalLayerZIndex`: имя приходит
   * параметром (дефолт живёт в `overlayStack.ts`), а `var()` собирается в
   * рантайме. Статический скан такое не видит.
   */
  dynamicTokens: ['gr-z-modal'],
  dependencies: ['GrIcon'],
  safelist: grImageViewerSafelist,
  tokenDefinitionsRef: {
    light: { url: './themes/light.css', selector: ':root' },
    dark: { url: './themes/dark.css', as: '.dark, [data-theme="dark"]' },
  },
})
