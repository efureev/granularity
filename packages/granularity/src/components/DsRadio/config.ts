import { defineGranularityComponentConfig } from '../../registry/componentConfig'

import { dsRadioSafelist } from './safelist'

export const dsRadioConfig = defineGranularityComponentConfig(import.meta.url, {
  name: 'DsRadio',
  dependencies: ['DsButton'],
  safelist: dsRadioSafelist,
})