import { defineGranularityComponentConfig } from '../../registry/componentConfig'

import { dsCheckboxSafelist } from './safelist'

export const dsCheckboxConfig = defineGranularityComponentConfig(import.meta.url, {
  name: 'DsCheckbox',
  safelist: dsCheckboxSafelist,
})