import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

export const dsPaginationConfig = defineGranularComponent(import.meta.url, {
  name: 'DsPagination',
  dependencies: ['DsButton', 'DsSelect'],
  safelist: [],
})
