import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

import { grTooltipSafelist } from './safelist'

export const grTooltipConfig = defineGranularComponent(import.meta.url, {
  name: 'GrTooltip',
  dependencies: ['GrIcon'],
  safelist: grTooltipSafelist,
})
