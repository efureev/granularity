import { defineGranumComponent } from '@feugene/granum/contract'

import { grInputTagSafelist } from './safelist'

export const grInputTagConfig = defineGranumComponent(import.meta.url, {
  name: 'GrInputTag',
  dependencies: ['GrChip', 'GrIcon'],
  safelist: grInputTagSafelist,
})
