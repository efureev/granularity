import { defineGranumComponent } from '@feugene/granum/contract'

import { grValueSafelist } from './safelist'

export const grValueConfig = defineGranumComponent(import.meta.url, {
  name: 'GrValue',
  safelist: grValueSafelist,
})
