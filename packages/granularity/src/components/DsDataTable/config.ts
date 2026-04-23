import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

// safelist пустой — все классы прописаны литералами в шаблоне, UnoCSS находит сканом
export const dsDataTableConfig = defineGranularComponent(import.meta.url, {
  name: 'DsDataTable',
  safelist: [],
  dependencies: ['DsTable', 'DsIcon'],
})
