import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

// safelist пустой — все классы прописаны литералами в шаблоне, UnoCSS находит сканом
export const grDataTableConfig = defineGranularComponent(import.meta.url, {
  name: 'GrDataTable',
  safelist: [],
  dependencies: ['GrTable', 'GrIcon'],
})
