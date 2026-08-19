import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

import { grDateRangePickerSafelist } from './safelist'

/**
 * Панель — сетка `GrCalendar` в поповере ядра: оба ребра объявлены, иначе
 * потребитель, выбравший один `GrDateRangePicker`, получил бы и сетку, и
 * панель без стилей.
 */
export const grDateRangePickerConfig = defineGranularComponent(import.meta.url, {
  name: 'GrDateRangePicker',
  safelist: grDateRangePickerSafelist,
  dependencies: [
    'GrCalendar',
    { provider: '@feugene/granularity', components: ['GrPopover', 'GrButton'] },
  ],
})
