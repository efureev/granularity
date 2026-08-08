import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

export const grDialogServiceConfig = defineGranularComponent(import.meta.url, {
  // Совпадает с именем директории: из него пресет строит scan-glob
  // `dist/components/<name>/**`.
  name: 'GrDialogService',
  dependencies: ['GrButton', 'GrConfirmDialog', 'GrPromptDialog'],
})
