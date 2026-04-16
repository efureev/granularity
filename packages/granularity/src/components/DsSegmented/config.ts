import { defineGranularityComponentConfig } from '../../registry/componentConfig'

import { dsSegmentedSafelist } from './safelist'

export const dsSegmentedConfig = defineGranularityComponentConfig(import.meta.url, {
  name: 'DsSegmented',
  safelist: dsSegmentedSafelist,
  cssFiles: ['./tokens.css'],
})