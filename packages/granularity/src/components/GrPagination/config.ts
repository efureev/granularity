import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

export const grPaginationConfig = defineGranularComponent(import.meta.url, {
  name: 'GrPagination',
  dependencies: ['GrButton', 'GrSelect'],
  safelist: [],
})
