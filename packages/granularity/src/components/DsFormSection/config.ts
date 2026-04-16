import { defineGranularityComponentConfig } from '../../registry/componentConfig'

import { dsFormSectionSafelist } from './safelist'

export const dsFormSectionConfig = defineGranularityComponentConfig(import.meta.url, {
  name: 'DsFormSection',
  safelist: dsFormSectionSafelist,
})