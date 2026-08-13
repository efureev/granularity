import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

import { grDashboardToolbarSafelist } from './safelist'

export const grDashboardToolbarConfig = defineGranularComponent(import.meta.url, {
  name: 'GrDashboardToolbar',
  group: 'GrDashboardFrame',
  safelist: grDashboardToolbarSafelist,
  dependencies: [{ provider: '@feugene/granularity', components: ['GrButton'] }],
})
