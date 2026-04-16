import { defineGranularityComponentConfig } from '../../registry/componentConfig'

import { dsTabsSafelist } from './safelist'

export const dsTabsConfig = defineGranularityComponentConfig(import.meta.url, {
  name: 'DsTabs',
  safelist: dsTabsSafelist,
})