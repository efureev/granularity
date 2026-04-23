import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

export const dsFileUploadConfig = defineGranularComponent(import.meta.url, {
  name: 'DsFileUpload',
  dependencies: ['DsIcon'],
  // Литералы из шаблона UnoCSS находит сканом — safelist не нужен.
  safelist: [],
})
