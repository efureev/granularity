import { defineGranularityComponentConfig } from '../../registry/componentConfig'

import { dsConfirmDialogSafelist } from './safelist'

export const dsConfirmDialogConfig = defineGranularityComponentConfig(import.meta.url, {
  name: 'DsConfirmDialog',
  dependencies: ['DsButton', 'DsDialog'],
  safelist: dsConfirmDialogSafelist,
})