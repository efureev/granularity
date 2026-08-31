import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

import { grCodeEditorSafelist } from './safelist'

/**
 * Компонентных зависимостей нет: редактор рисует себя сам, а `CodeMirror` —
 * внешняя библиотека, а не компонент дизайн-системы. Общая с блоком карта ролей
 * приходит `.ts`-модулем, и её классы объявлены в собственном safelist.
 */
export const grCodeEditorConfig = defineGranularComponent(import.meta.url, {
  name: 'GrCodeEditor',
  safelist: grCodeEditorSafelist,
})
