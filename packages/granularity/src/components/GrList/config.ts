import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

import { grListSafelist } from './safelist'

export const grListConfig = defineGranularComponent(import.meta.url, {
  name: 'GrList',
  safelist: grListSafelist,
  dependencies: ['GrCard', 'GrSkeleton'],
})
