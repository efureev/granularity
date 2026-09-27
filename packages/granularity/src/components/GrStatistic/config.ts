import { defineGranumComponent } from '@feugene/granum/contract'

import { grStatisticSafelist } from './safelist'

export const grStatisticConfig = defineGranumComponent(import.meta.url, {
  name: 'GrStatistic',
  safelist: grStatisticSafelist,
  dependencies: ['GrSkeleton', 'GrValue'],
})
