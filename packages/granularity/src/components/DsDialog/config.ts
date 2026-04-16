import { defineGranularityComponentConfig } from '../../registry/componentConfig'

import { dsDialogSafelist } from './dsDialogStyles'

export const dsDialogConfig = defineGranularityComponentConfig(import.meta.url, {
  name: 'DsDialog',
  dependencies: ['DsButton', 'DsModal'],
  safelist: dsDialogSafelist,
})
