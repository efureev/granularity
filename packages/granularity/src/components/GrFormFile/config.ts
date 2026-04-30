import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

export const grFormFileConfig = defineGranularComponent(import.meta.url, {
  name: 'GrFormFile',
  dependencies: ['GrButton', 'GrIcon'],
  // Литералы из шаблона UnoCSS находит сканом — safelist не нужен.
  safelist: [],
})
