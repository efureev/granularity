import { defineGranumComponent } from '@feugene/granum/contract'

import { grToasterSafelist } from './safelist'

export const grToasterConfig = defineGranumComponent(import.meta.url, {
  name: 'GrToaster',
  dependencies: ['GrButton', 'GrIcon'],
  safelist: grToasterSafelist,
})
