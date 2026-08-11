import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

import { grProgressCircleSafelist } from './safelist'

export const grProgressCircleConfig = defineGranularComponent(import.meta.url, {
  name: 'GrProgressCircle',
  safelist: grProgressCircleSafelist,
})
