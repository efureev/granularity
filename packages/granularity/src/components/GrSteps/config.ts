import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

import { grStepsSafelist } from './safelist'

export const grStepsConfig = defineGranularComponent(import.meta.url, {
  name: 'GrSteps',
  // Компактный вариант рендерит полосу прогресса — это ребро графа.
  dependencies: ['GrProgressBar'],
  safelist: grStepsSafelist,
})
