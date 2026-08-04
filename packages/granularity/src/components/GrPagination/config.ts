import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

import { grPaginationSafelist } from './safelist'

export const grPaginationConfig = defineGranularComponent(import.meta.url, {
  name: 'GrPagination',
  dependencies: ['GrButton', 'GrSelect'],
  safelist: grPaginationSafelist,
})
