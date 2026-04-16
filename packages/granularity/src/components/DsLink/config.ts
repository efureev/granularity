import { defineGranularityComponentConfig } from '../../registry/componentConfig'

import { dsLinkSafelist } from './safelist'

export const dsLinkConfig = defineGranularityComponentConfig(import.meta.url, {
  name: 'DsLink',
  safelist: dsLinkSafelist,
})