import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

import { grDataTableSafelist } from './safelist'

export const grDataTableConfig = defineGranularComponent(import.meta.url, {
  name: 'GrDataTable',
  dependencies: ['GrTable', 'GrIcon'],
  safelist: grDataTableSafelist,
})
