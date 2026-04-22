import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

export const dsCollapseConfig = defineGranularComponent(import.meta.url, {
  name: 'DsCollapse',
  dependencies: ['DsCard', 'DsIcon'],
  safelist: [],
})
