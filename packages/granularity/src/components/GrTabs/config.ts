import { defineGranumComponent } from '@feugene/granum/contract'

import { grTabsSafelist } from './safelist'

export const grTabsConfig = defineGranumComponent(import.meta.url, {
  name: 'GrTabs',
  safelist: grTabsSafelist,
})
