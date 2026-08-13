import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

import { grSparklineSafelist } from './safelist'

/** Зависимостей нет: спарклайн не рендерит ни одного чужого компонента. */
export const grSparklineConfig = defineGranularComponent(import.meta.url, {
  name: 'GrSparkline',
  safelist: grSparklineSafelist,
})
