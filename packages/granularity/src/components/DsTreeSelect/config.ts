import { defineGranularityComponentConfig } from '../../registry/componentConfig'

import { dsTreeSelectSafelist } from './safelist'

export const dsTreeSelectConfig = defineGranularityComponentConfig(import.meta.url, {
  name: 'DsTreeSelect',
  safelist: dsTreeSelectSafelist,
  dependencies: ['DsInput', 'DsTree'],
})