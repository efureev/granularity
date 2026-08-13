import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

import { grDashboardPaletteSafelist } from './safelist'

export const grDashboardPaletteConfig = defineGranularComponent(import.meta.url, {
  name: 'GrDashboardPalette',
  group: 'GrDashboardFrame',
  safelist: grDashboardPaletteSafelist,
  dependencies: [{ provider: '@feugene/granularity', components: ['GrButton'] }],
})
