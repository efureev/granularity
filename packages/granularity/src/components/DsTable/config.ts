import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

// Все классы DsTable — статические литералы в шаблоне, UnoCSS найдёт их сканом.
export const dsTableConfig = defineGranularComponent(import.meta.url, {
  name: 'DsTable',
  dependencies: [],
  safelist: [],
})
