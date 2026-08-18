import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

import { grInputTagSafelist } from './safelist'

export const grInputTagConfig = defineGranularComponent(import.meta.url, {
  name: 'GrInputTag',
  dependencies: ['GrChip', 'GrIcon'],
  safelist: grInputTagSafelist,
})