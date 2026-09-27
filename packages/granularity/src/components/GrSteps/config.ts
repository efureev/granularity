import { defineGranumComponent } from '@feugene/granum/contract'

import { grStepsSafelist } from './safelist'

export const grStepsConfig = defineGranumComponent(import.meta.url, {
  name: 'GrSteps',
  // Компактный вариант рендерит полосу прогресса — это ребро графа.
  dependencies: ['GrProgressBar'],
  safelist: grStepsSafelist,
})
