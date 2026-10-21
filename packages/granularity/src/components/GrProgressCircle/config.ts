import { defineGranumComponent } from '@feugene/granum/contract'

import { grProgressCircleSafelist } from './safelist'

export const grProgressCircleConfig = defineGranumComponent(import.meta.url, {
  name: 'GrProgressCircle',
  safelist: grProgressCircleSafelist,
})
