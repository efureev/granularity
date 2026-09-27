import { defineGranumComponent } from '@feugene/granum/contract'

export const grPromptDialogConfig = defineGranumComponent(import.meta.url, {
  name: 'GrPromptDialog',
  dependencies: ['GrButton', 'GrDialog', 'GrFormField', 'GrInput', 'GrResponseErrorBanner', 'GrTextarea'],
})
