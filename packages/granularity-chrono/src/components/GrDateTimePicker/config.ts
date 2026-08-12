import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

import { grDateTimePickerSafelist } from './safelist'

/**
 * Панель собрана из чужой разметки целиком: сетка — `GrCalendar`, колонки
 * времени — внутренний компонент `GrTimePicker`, кнопки подтверждения —
 * `GrButton` ядра. Все три ребра объявлены: пресет подмешивает safelist и CSS
 * только тем компонентам, что попали в селекцию, и без графа потребитель,
 * выбравший один `GrDateTimePicker`, получил бы панель без стилей.
 */
export const grDateTimePickerConfig = defineGranularComponent(import.meta.url, {
  name: 'GrDateTimePicker',
  safelist: grDateTimePickerSafelist,
  dependencies: [
    'GrCalendar',
    'GrTimePicker',
    { provider: '@feugene/granularity', components: ['GrPopover', 'GrButton'] },
  ],
})
