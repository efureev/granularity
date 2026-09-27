import { defineGranumComponent } from '@feugene/granum/contract'

import { grDividerSafelist } from './safelist'

export const grDividerConfig = defineGranumComponent(import.meta.url, {
  name: 'GrDivider',
  safelist: grDividerSafelist,
})
