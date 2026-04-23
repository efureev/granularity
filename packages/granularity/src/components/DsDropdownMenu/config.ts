import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

export const dsDropdownMenuConfig = defineGranularComponent(import.meta.url, {
  name: 'DsDropdownMenu',
  dependencies: ['DsDropdown'],
  // Все токены прописаны статически в шаблонах подкомпонентов — UnoCSS находит их сканом.
  safelist: [],
})
