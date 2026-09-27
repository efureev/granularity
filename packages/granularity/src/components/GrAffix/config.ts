import { defineGranumComponent } from '@feugene/granum/contract'

import { grAffixSafelist } from './safelist'

export const grAffixConfig = defineGranumComponent(import.meta.url, {
  name: 'GrAffix',
  safelist: grAffixSafelist,
})
