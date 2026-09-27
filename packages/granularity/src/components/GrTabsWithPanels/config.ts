import { defineGranumComponent } from '@feugene/granum/contract'

export const grTabsWithPanelsConfig = defineGranumComponent(import.meta.url, {
  name: 'GrTabsWithPanels',
  dependencies: ['GrTabPanels', 'GrTabs'],
})
