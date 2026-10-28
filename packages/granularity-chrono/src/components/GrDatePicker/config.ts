import { defineGranumComponent } from '@feugene/granum/contract'

import { grDatePickerSafelist } from './safelist'

/**
 * Пикер рендерит сетку своего пакета и поповер ядра — оба ребра объявлены.
 *
 * Без второго потребитель, выбравший только `GrDatePicker`, получил бы панель
 * без фона, рамки и тени: granum подмешивает safelist и CSS лишь тем
 * компонентам, что попали в селекцию, а `GrPopover` попадает в неё только через
 * этот граф. Поле — рамка поля ядра (`pickerFieldAttrs`): её лист живёт в
 * `GrInput` и приезжает по его ребру.
 */
export const grDatePickerConfig = defineGranumComponent(import.meta.url, {
  name: 'GrDatePicker',
  safelist: grDatePickerSafelist,
  dependencies: [
    'GrCalendar',
    { provider: '@feugene/granularity', components: ['GrPopover', 'GrButton', 'GrInput'] },
  ],
})
