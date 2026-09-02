import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

import { grTransferSafelist } from './safelist'

export const grTransferConfig = defineGranularComponent(import.meta.url, {
  name: 'GrTransfer',
  dependencies: ['GrButton', 'GrButtonGroup', 'GrCheckbox', 'GrInput'],
  safelist: grTransferSafelist,
})
