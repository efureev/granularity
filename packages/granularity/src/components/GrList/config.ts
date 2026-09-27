import { defineGranumComponent } from '@feugene/granum/contract'

import { grListSafelist } from './safelist'

export const grListConfig = defineGranumComponent(import.meta.url, {
  name: 'GrList',
  safelist: grListSafelist,
  dependencies: ['GrCard', 'GrSkeleton'],
})
