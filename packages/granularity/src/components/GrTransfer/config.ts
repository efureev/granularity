import { defineGranumComponent } from '@feugene/granum/contract'

import { grTransferSafelist } from './safelist'

export const grTransferConfig = defineGranumComponent(import.meta.url, {
  name: 'GrTransfer',
  dependencies: ['GrButton', 'GrButtonGroup', 'GrCheckbox', 'GrInput'],
  safelist: grTransferSafelist,
})
