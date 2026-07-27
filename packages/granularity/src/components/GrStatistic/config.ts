import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

import { grStatisticSafelist } from './safelist'

export const grStatisticConfig = defineGranularComponent(import.meta.url, {
  name: 'GrStatistic',
  safelist: grStatisticSafelist,
  dependencies: ['GrSkeleton'],
})
