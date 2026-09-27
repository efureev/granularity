import { defineGranumComponent } from '@feugene/granum/contract'

import { grCollapseSafelist } from './safelist'

export const grCollapseConfig = defineGranumComponent(import.meta.url, {
  name: 'GrCollapse',
  dependencies: ['GrCard', 'GrIcon'],
  safelist: grCollapseSafelist,
})
