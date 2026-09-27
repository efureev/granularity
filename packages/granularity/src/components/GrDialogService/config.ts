import { defineGranumComponent } from '@feugene/granum/contract'

export const grDialogServiceConfig = defineGranumComponent(import.meta.url, {
  // Совпадает с именем директории: из него пресет строит scan-glob
  // `dist/components/<name>/**`.
  name: 'GrDialogService',
  dependencies: ['GrButton', 'GrConfirmDialog', 'GrPromptDialog'],
})
