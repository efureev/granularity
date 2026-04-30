import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

export const grImageViewerConfig = defineGranularComponent(import.meta.url, {
  name: 'GrImageViewer',
  // Литералы из шаблона UnoCSS находит сканом — safelist не нужен.
  safelist: [],
})
