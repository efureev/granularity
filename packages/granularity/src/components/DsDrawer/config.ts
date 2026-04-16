import { defineGranularityComponentConfig } from '../../registry/componentConfig'

import { dsDrawerSafelist } from './safelist'

export const dsDrawerConfig = defineGranularityComponentConfig(import.meta.url, {
  name: 'DsDrawer',
  dependencies: ['DsButton'],
  safelist: dsDrawerSafelist,
})