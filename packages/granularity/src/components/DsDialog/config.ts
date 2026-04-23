import {defineGranularComponent} from '@feugene/unocss-preset-granular/contract'

import { dsDialogSafelist } from './safelist'

export const dsDialogConfig = defineGranularComponent(import.meta.url, {
  name: 'DsDialog',
  dependencies: ['DsButton', 'DsModal'],
  safelist: dsDialogSafelist,
})
