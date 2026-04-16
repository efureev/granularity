import { defineGranularityComponentConfig } from '../../registry/componentConfig'

import { dsButtonGroupSafelist } from './safelist'

export const dsButtonGroupConfig = defineGranularityComponentConfig(import.meta.url, {
  name: 'DsButtonGroup',
  safelist: dsButtonGroupSafelist,
  cssFiles: ['./styles.css'],
})