import { defineGranumComponent } from '@feugene/granum/contract'

import { grNumberInputSafelist } from './safelist'

export const grNumberInputConfig = defineGranumComponent(import.meta.url, {
  name: 'GrNumberInput',
  dependencies: ['GrIcon'],
  safelist: grNumberInputSafelist,
})
