import { defineGranumComponent } from '@feugene/granum/contract'

import { grRichTextSafelist } from './grRichTextStyles'

/**
 * Тулбар собран из `GrButton` ядра, пузырьковое меню — из `GrPopover`. Оба
 * ребра объявлены: granum подмешивает safelist и CSS только тем компонентам,
 * что попали в селекцию, и без графа потребитель, выбравший один `GrRichText`,
 * получил бы панель без кнопок и всплывающее меню без подложки.
 *
 * Собственный CSS в `cssFiles` не объявлен, и объявлять его не нужно:
 * `granumProvider()` находит `styles.css` рядом с компонентом сам и пишет его
 * в манифест — оттуда его и забирает приложение.
 */
export const grRichTextConfig = defineGranumComponent(import.meta.url, {
  name: 'GrRichText',
  safelist: grRichTextSafelist,
  dependencies: [
    { provider: '@feugene/granularity', components: ['GrButton', 'GrPopover'] },
  ],
})
