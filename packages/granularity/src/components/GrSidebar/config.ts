import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

import { grSidebarSafelist } from './safelist'

export const grSidebarConfig = defineGranularComponent(import.meta.url, {
  name: 'GrSidebar',
  /**
   * Высоту модального слоя задаёт `useModalOverlay` → `modalLayerZIndex`: имя
   * приходит параметром, а `var()` собирается в рантайме, и статический скан
   * такое не видит. Без объявления обрезка токенов у потребителя сняла бы
   * объявление молча — `z-index` разрешился бы в `unset`, и панель уехала бы
   * под соседний слой.
   */
  dynamicTokens: ['gr-z-modal'],
  dependencies: ['GrButton', 'GrIcon', 'GrTooltip'],
  safelist: grSidebarSafelist,
})
