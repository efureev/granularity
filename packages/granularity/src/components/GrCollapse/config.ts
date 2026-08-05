import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

import { grCollapseSafelist } from './safelist'

export const grCollapseConfig = defineGranularComponent(import.meta.url, {
  name: 'GrCollapse',
  dependencies: ['GrCard', 'GrIcon'],
  safelist: grCollapseSafelist,
})
