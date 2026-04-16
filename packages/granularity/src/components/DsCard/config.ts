import { defineGranularityComponentConfig } from '../../registry/componentConfig'

import { dsCardSafelist } from './safelist'

export const dsCardConfig = defineGranularityComponentConfig(import.meta.url, {
  name: 'DsCard',
  safelist: dsCardSafelist,
})