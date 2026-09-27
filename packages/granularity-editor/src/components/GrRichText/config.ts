import { defineGranumComponent } from '@feugene/granum/contract'

import { grRichTextSafelist } from './grRichTextStyles'

/**
 * Тулбар собран из `GrButton` ядра, пузырьковое меню — из `GrPopover`. Оба
 * ребра объявлены: granum подмешивает safelist и CSS только тем компонентам,
 * что попали в селекцию, и без графа потребитель, выбравший один `GrRichText`,
 * получил бы панель без кнопок и всплывающее меню без подложки.
 *
 * Собственный CSS компонента (`tokens.css`, `styles.css`) в `cssFiles` не
 * объявлен: он импортируется из SFC и уезжает в его чанк через `libInjectCss`.
 * `cssFiles` ждал бы отдельных файлов в `dist/components/<Name>/`, которых при
 * инлайне не существует.
 */
export const grRichTextConfig = defineGranumComponent(import.meta.url, {
  name: 'GrRichText',
  safelist: grRichTextSafelist,
  dependencies: [
    { provider: '@feugene/granularity', components: ['GrButton', 'GrPopover'] },
  ],
})
