import { defineGranumComponent } from '@feugene/granum/contract'

import { grEmptyStateSafelist } from './safelist'

export const grEmptyStateConfig = defineGranumComponent(import.meta.url, {
  name: 'GrEmptyState',
  safelist: grEmptyStateSafelist,
  dependencies: ['GrIcon'],
})
