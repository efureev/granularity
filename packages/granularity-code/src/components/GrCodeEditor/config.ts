import { defineGranumComponent } from '@feugene/granum/contract'

import { grCodeEditorSafelist } from './safelist'

/**
 * Рамка редактора — поле ядра: её атрибуты ставит `grFieldLookAttrs`, а лист
 * живёт в `GrInput`, и без ребра он не попал бы в приложение. `CodeMirror` —
 * внешняя библиотека, а не компонент дизайн-системы. Общая с блоком карта ролей
 * приходит `.ts`-модулем, и её классы granum извлекает по графу бандла.
 */
export const grCodeEditorConfig = defineGranumComponent(import.meta.url, {
  name: 'GrCodeEditor',
  safelist: grCodeEditorSafelist,
  dependencies: [{ provider: '@feugene/granularity', components: ['GrInput'] }],
  // Подсветка — палитра `GrCodeBlock`: её хуки объявляет его реестр.
  hookTokens: ['--gr-code-block-*'],
})
