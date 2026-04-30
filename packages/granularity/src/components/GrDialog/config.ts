import {defineGranularComponent} from '@feugene/unocss-preset-granular/contract'

import { grDialogSafelist } from './safelist'

export const grDialogConfig = defineGranularComponent(import.meta.url, {
  name: 'GrDialog',
  dependencies: ['GrButton', 'GrModal'],
  safelist: grDialogSafelist,
})
