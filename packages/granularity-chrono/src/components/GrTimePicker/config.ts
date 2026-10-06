import { defineGranumComponent } from '@feugene/granum/contract'

import { grTimePickerSafelist } from './safelist'

/**
 * Пикер рендерит поповер ядра — ребро объявлено. Без него потребитель,
 * выбравший только `GrTimePicker`, получил бы панель без фона, рамки и тени:
 * granum подмешивает safelist и CSS лишь тем компонентам, что попали в
 * селекцию, а `GrPopover` попадает в неё только через этот граф.
 */
export const grTimePickerConfig = defineGranumComponent(import.meta.url, {
  name: 'GrTimePicker',
  safelist: grTimePickerSafelist,
  dependencies: [
    { provider: '@feugene/granularity', components: ['GrPopover'] },
  ],
})
