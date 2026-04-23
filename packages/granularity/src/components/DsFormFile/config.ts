import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

export const dsFormFileConfig = defineGranularComponent(import.meta.url, {
  name: 'DsFormFile',
  dependencies: ['DsButton', 'DsIcon'],
  // Литералы из шаблона UnoCSS находит сканом — safelist не нужен.
  safelist: [],
})
