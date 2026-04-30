import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

export const grCollapseConfig = defineGranularComponent(import.meta.url, {
  name: 'GrCollapse',
  dependencies: ['GrCard', 'GrIcon'],
  safelist: [],
})
