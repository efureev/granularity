import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

export const dsImageViewerConfig = defineGranularComponent(import.meta.url, {
  name: 'DsImageViewer',
  // Литералы из шаблона UnoCSS находит сканом — safelist не нужен.
  safelist: [],
})
