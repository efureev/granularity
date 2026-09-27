import { defineGranumComponent } from '@feugene/granum/contract'

import { grDashboardPaletteSafelist } from './safelist'

export const grDashboardPaletteConfig = defineGranumComponent(import.meta.url, {
  name: 'GrDashboardPalette',
  group: 'GrDashboardFrame',
  safelist: grDashboardPaletteSafelist,
  dependencies: [{ provider: '@feugene/granularity', components: ['GrButton'] }],
})
