import { defineGranumComponent } from '@feugene/granum/contract'

import { grTimePickerSafelist } from './safelist'

/**
 * Пикер рендерит поповер ядра, а его поле — рамка поля ядра
 * (`pickerFieldAttrs`), лист которой живёт в `GrInput`; оба ребра объявлены. Без
 * них потребитель, выбравший только `GrTimePicker`, получил бы панель без фона,
 * рамки и тени и поле без рамки: granum подмешивает safelist и CSS лишь тем
 * компонентам, что попали в селекцию.
 */
export const grTimePickerConfig = defineGranumComponent(import.meta.url, {
  name: 'GrTimePicker',
  safelist: grTimePickerSafelist,
  dependencies: [
    { provider: '@feugene/granularity', components: ['GrPopover', 'GrInput'] },
  ],
})
