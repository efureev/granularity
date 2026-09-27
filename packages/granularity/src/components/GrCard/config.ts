import { defineGranumComponent } from '@feugene/granum/contract'

import { grCardSafelist } from './safelist'

export const grCardConfig = defineGranumComponent(import.meta.url, {
  name: 'GrCard',
  safelist: grCardSafelist,
})
