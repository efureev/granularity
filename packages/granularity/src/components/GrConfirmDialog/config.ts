import { defineGranumComponent } from '@feugene/granum/contract'

export const grConfirmDialogConfig = defineGranumComponent(import.meta.url, {
  name: 'GrConfirmDialog',
  dependencies: ['GrButton', 'GrDialog', 'GrResponseErrorBanner'],
})
