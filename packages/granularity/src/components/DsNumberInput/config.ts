import { defineGranularityComponentConfig } from '../../registry/componentConfig'

import { dsNumberInputSafelist } from './safelist'

export const dsNumberInputConfig = defineGranularityComponentConfig(import.meta.url, {
  name: 'DsNumberInput',
  safelist: dsNumberInputSafelist,
})