import { defineGranumComponent } from '@feugene/granum/contract'

import { grCarouselSafelist } from './safelist'

/**
 * `dependencies` пуст намеренно: стрелки и тумблер — обычные `<button>`, а не
 * `GrButton`. Тот связывает `disabled` с нативным атрибутом, а стрелка на краю
 * без `loop` обязана остаться фокусируемой (`aria-disabled`), иначе фокус
 * падает в `<body>` ровно в момент, когда пользователь долистал до конца.
 */
export const grCarouselConfig = defineGranumComponent(import.meta.url, {
  name: 'GrCarousel',
  safelist: grCarouselSafelist,
})
