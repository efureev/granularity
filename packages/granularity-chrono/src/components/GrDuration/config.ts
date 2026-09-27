import { defineGranumComponent } from '@feugene/granum/contract'

import { grDurationSafelist } from './safelist'

export const grDurationConfig = defineGranumComponent(import.meta.url, {
  name: 'GrDuration',
  safelist: grDurationSafelist,
})
