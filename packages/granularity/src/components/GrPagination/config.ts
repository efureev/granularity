import { defineGranumComponent } from '@feugene/granum/contract'

import { grPaginationSafelist } from './safelist'

export const grPaginationConfig = defineGranumComponent(import.meta.url, {
  name: 'GrPagination',
  dependencies: ['GrButton', 'GrSelect'],
  safelist: grPaginationSafelist,
})
