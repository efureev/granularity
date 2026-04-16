import { defineGranularityComponentConfig } from '../../registry/componentConfig'

import { dsPromptDialogSafelist } from './safelist'

export const dsPromptDialogConfig = defineGranularityComponentConfig(import.meta.url, {
  name: 'DsPromptDialog',
  dependencies: ['DsButton', 'DsDialog', 'DsFormField', 'DsInput'],
  safelist: dsPromptDialogSafelist,
})