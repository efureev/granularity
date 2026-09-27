import { defineGranumComponent } from '@feugene/granum/contract'

import { grTreeSafelist } from './safelist'

export const grTreeConfig = defineGranumComponent(import.meta.url, {
  name: 'GrTree',
  safelist: grTreeSafelist,
})
