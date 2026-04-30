import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

export const grFileUploadConfig = defineGranularComponent(import.meta.url, {
  name: 'GrFileUpload',
  dependencies: ['GrIcon'],
  // Литералы из шаблона UnoCSS находит сканом — safelist не нужен.
  safelist: [],
})
