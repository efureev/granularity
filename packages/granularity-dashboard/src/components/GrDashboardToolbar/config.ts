import { defineGranumComponent } from '@feugene/granum/contract'

import { grDashboardToolbarSafelist } from './safelist'

export const grDashboardToolbarConfig = defineGranumComponent(import.meta.url, {
  name: 'GrDashboardToolbar',
  group: 'GrDashboardFrame',
  safelist: grDashboardToolbarSafelist,
  dependencies: [{ provider: '@feugene/granularity', components: ['GrButton'] }],
})
