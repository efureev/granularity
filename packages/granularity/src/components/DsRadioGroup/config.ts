import { defineGranularityComponentConfig } from '../../registry/componentConfig'

import { dsRadioGroupSafelist } from './safelist'

export const dsRadioGroupConfig = defineGranularityComponentConfig(import.meta.url, {
  name: 'DsRadioGroup',
  dependencies: ['DsButtonGroup', 'DsRadio'],
  safelist: dsRadioGroupSafelist,
})