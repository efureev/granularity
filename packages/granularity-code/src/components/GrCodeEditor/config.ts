import { defineGranumComponent } from '@feugene/granum/contract'

import { grCodeEditorSafelist } from './safelist'

/**
 * Компонентных зависимостей нет: редактор рисует себя сам, а `CodeMirror` —
 * внешняя библиотека, а не компонент дизайн-системы. Общая с блоком карта ролей
 * приходит `.ts`-модулем, и её классы granum извлекает по графу бандла.
 */
export const grCodeEditorConfig = defineGranumComponent(import.meta.url, {
  name: 'GrCodeEditor',
  safelist: grCodeEditorSafelist,
})
