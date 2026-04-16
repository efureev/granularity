import { defineGranularityComponentConfig } from '../../registry/componentConfig'

import { dsInputSafelist } from './dsInputStyles'

export const dsInputConfig = defineGranularityComponentConfig(import.meta.url, {
  name: 'DsInput',
  safelist: dsInputSafelist,
})
