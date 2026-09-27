import { defineGranumComponent } from '@feugene/granum/contract'

import { grSparklineSafelist } from './safelist'

/** Зависимостей нет: спарклайн не рендерит ни одного чужого компонента. */
export const grSparklineConfig = defineGranumComponent(import.meta.url, {
  name: 'GrSparkline',
  safelist: grSparklineSafelist,
})
