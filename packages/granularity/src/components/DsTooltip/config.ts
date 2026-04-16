import { defineGranularityComponentConfig } from '../../registry/componentConfig'

import { dsTooltipSafelist } from './safelist'

export const dsTooltipConfig = defineGranularityComponentConfig(import.meta.url, {
  name: 'DsTooltip',
  safelist: dsTooltipSafelist,
})