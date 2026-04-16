import { defineGranularityComponentConfig } from '../../registry/componentConfig'

import { dsSelectSafelist } from './safelist'

export const dsSelectConfig = defineGranularityComponentConfig(import.meta.url, {
  name: 'DsSelect',
  dependencies: ['DsInput'],
  safelist: dsSelectSafelist,
})