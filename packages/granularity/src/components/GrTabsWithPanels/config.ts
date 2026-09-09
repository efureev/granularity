import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

export const grTabsWithPanelsConfig = defineGranularComponent(import.meta.url, {
  name: 'GrTabsWithPanels',
  dependencies: ['GrTabPanels', 'GrTabs'],
})
