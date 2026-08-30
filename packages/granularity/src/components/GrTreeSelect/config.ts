import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

import { grTreeSelectSafelist } from './safelist'

export const grTreeSelectConfig = defineGranularComponent(import.meta.url, {
  name: 'GrTreeSelect',
  /**
   * Слой панели задаёт `useFloating` → `floatingLayerZIndex`: имя приходит
   * параметром, а `var()` собирается в рантайме (`overlayStack.ts`). В
   * исходниках `var(--gr-z-*)` не встречается, статический скан их не видит.
   *
   * `gr-z-modal` — из ветки `calc(var(--gr-z-modal) + N)`: панель, открытая
   * внутри модалки, встаёт над ней.
   */
  dynamicTokens: ['gr-z-dropdown', 'gr-z-modal'],
  safelist: grTreeSelectSafelist,
  dependencies: ['GrInput', 'GrTree'],
})
