import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

import { grDatePickerSafelist } from './safelist'

/**
 * Пикер рендерит сетку своего пакета и поповер ядра — оба ребра объявлены.
 *
 * Без второго потребитель, выбравший только `GrDatePicker`, получил бы панель
 * без фона, рамки и тени: пресет подмешивает safelist и CSS лишь тем
 * компонентам, что попали в селекцию, а `GrPopover` попадает в неё только через
 * этот граф.
 */
export const grDatePickerConfig = defineGranularComponent(import.meta.url, {
  name: 'GrDatePicker',
  safelist: grDatePickerSafelist,
  dependencies: [
    'GrCalendar',
    { provider: '@feugene/granularity', components: ['GrPopover'] },
  ],
})
