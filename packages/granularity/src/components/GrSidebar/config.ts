import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

import { grSidebarSafelist } from './safelist'

export const grSidebarConfig = defineGranularComponent(import.meta.url, {
  name: 'GrSidebar',
  dependencies: ['GrButton', 'GrIcon'],
  safelist: grSidebarSafelist,
})
