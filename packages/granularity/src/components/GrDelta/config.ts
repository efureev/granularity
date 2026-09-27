import { defineGranumComponent } from '@feugene/granum/contract'

import { grDeltaSafelist } from './safelist'

export const grDeltaConfig = defineGranumComponent(import.meta.url, {
  name: 'GrDelta',
  dependencies: ['GrValue'],
  safelist: grDeltaSafelist,
})
