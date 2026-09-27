import { defineGranumComponent } from '@feugene/granum/contract'

import { grRadioSafelist } from './safelist'

export const grRadioConfig = defineGranumComponent(import.meta.url, {
  name: 'GrRadio',
  dependencies: ['GrButton'],
  safelist: grRadioSafelist,
})
