import { defineGranularityComponentConfig } from '../../registry/componentConfig'

import { dsFormFieldSafelist } from './dsFormFieldStyles'

export const dsFormFieldConfig = defineGranularityComponentConfig(import.meta.url, {
  name: 'DsFormField',
  safelist: dsFormFieldSafelist,
})
