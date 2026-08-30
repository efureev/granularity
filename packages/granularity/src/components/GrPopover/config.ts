import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

import { grPopoverSafelist } from './safelist'

export const grPopoverConfig = defineGranularComponent(import.meta.url, {
  name: 'GrPopover',
  /**
   * Слои задают `useFloating` и `useModalOverlay` через `overlayStack.ts`:
   * имя приходит параметром, а `var()` собирается в рантайме. В исходниках
   * `var(--gr-z-*)` не встречается — статический скан их не видит.
   */
  dynamicTokens: ['gr-z-dropdown', 'gr-z-modal'],
  safelist: grPopoverSafelist,
})
