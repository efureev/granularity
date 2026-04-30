import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

export const grDropdownMenuConfig = defineGranularComponent(import.meta.url, {
  name: 'GrDropdownMenu',
  dependencies: ['GrDropdown'],
  // Все токены прописаны статически в шаблонах подкомпонентов — UnoCSS находит их сканом.
  safelist: [],
})
