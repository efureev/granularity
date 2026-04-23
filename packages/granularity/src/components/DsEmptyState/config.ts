import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

export const dsEmptyStateConfig = defineGranularComponent(import.meta.url, {
  name: 'DsEmptyState',
  dependencies: ['DsIcon'],
  safelist: [],
})
