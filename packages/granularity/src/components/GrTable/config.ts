import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

import { grTableSafelist } from './safelist'

export const grTableConfig = defineGranularComponent(import.meta.url, {
  name: 'GrTable',
  dependencies: ['GrSkeleton'],
  safelist: grTableSafelist,
})
