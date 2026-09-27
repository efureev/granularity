import { defineGranumComponent } from '@feugene/granum/contract'

import { grDialogSafelist } from './safelist'

export const grDialogConfig = defineGranumComponent(import.meta.url, {
  name: 'GrDialog',
  dependencies: ['GrButton', 'GrModal'],
  safelist: grDialogSafelist,
})
