import { defineGranularityComponentConfig } from '../../registry/componentConfig'

import { dsSidebarSafelist } from './safelist'

export const dsSidebarConfig = defineGranularityComponentConfig(import.meta.url, {
  name: 'DsSidebar',
  safelist: dsSidebarSafelist,
})