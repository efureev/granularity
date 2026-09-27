import { defineGranumComponent } from '@feugene/granum/contract'

import { grKbdSafelist } from './safelist'

export const grKbdConfig = defineGranumComponent(import.meta.url, {
  name: 'GrKbd',
  safelist: grKbdSafelist,
})
