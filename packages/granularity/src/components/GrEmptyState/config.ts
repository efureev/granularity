import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

import { grEmptyStateSafelist } from './safelist'

export const grEmptyStateConfig = defineGranularComponent(import.meta.url, {
  name: 'GrEmptyState',
  safelist: grEmptyStateSafelist,
  dependencies: ['GrIcon'],
})
