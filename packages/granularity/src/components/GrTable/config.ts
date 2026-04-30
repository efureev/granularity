import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

// Все классы GrTable — статические литералы в шаблоне, UnoCSS найдёт их сканом.
export const grTableConfig = defineGranularComponent(import.meta.url, {
  name: 'GrTable',
  dependencies: [],
  safelist: [],
})
