import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

export const grEmptyStateConfig = defineGranularComponent(import.meta.url, {
  name: 'GrEmptyState',
  dependencies: ['GrIcon'],
  safelist: [],
})
