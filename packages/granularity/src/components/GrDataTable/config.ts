import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

export const grDataTableConfig = defineGranularComponent(import.meta.url, {
  name: 'GrDataTable',
  dependencies: ['GrTable', 'GrIcon'],
})
