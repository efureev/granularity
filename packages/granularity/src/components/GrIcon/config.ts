import { defineGranumComponent } from '@feugene/granum/contract'

import { grIconSafelist } from './safelist'

export const grIconConfig = defineGranumComponent(import.meta.url, {
  name: 'GrIcon',
  safelist: grIconSafelist,
})
