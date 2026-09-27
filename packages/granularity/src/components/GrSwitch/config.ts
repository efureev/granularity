import { defineGranumComponent } from '@feugene/granum/contract'

import { grSwitchSafelist } from './safelist'

export const grSwitchConfig = defineGranumComponent(import.meta.url, {
  name: 'GrSwitch',
  safelist: grSwitchSafelist,
})
