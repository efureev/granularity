import { defineGranumComponent } from '@feugene/granum/contract'

import { grTableSafelist } from './safelist'

export const grTableConfig = defineGranumComponent(import.meta.url, {
  name: 'GrTable',
  dependencies: ['GrSkeleton'],
  safelist: grTableSafelist,
})
