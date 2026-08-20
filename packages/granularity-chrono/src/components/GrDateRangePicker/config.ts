import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

import { grDateRangePickerSafelist } from './safelist'

/**
 * Панель собрана из чужой разметки: сетка — `GrCalendar`, колонки времени —
 * внутренний компонент `GrTimePicker`, поповер и кнопки — ядро. Все рёбра
 * объявлены, иначе потребитель, выбравший один `GrDateRangePicker`, получил бы
 * панель без стилей.
 *
 * Ребро к `GrTimePicker` безусловно, хотя колонки включает необязательный
 * `enable-time`: селекция статична, и по ней не видно, каким пропом компонент
 * будет вызван, — а импорт колонок в собранном чанке есть всегда.
 */
export const grDateRangePickerConfig = defineGranularComponent(import.meta.url, {
  name: 'GrDateRangePicker',
  safelist: grDateRangePickerSafelist,
  dependencies: [
    'GrCalendar',
    'GrTimePicker',
    { provider: '@feugene/granularity', components: ['GrPopover', 'GrButton'] },
  ],
})
