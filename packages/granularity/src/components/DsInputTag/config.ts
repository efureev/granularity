import { defineGranularityComponentConfig } from '../../registry/componentConfig'

import { dsInputTagSafelist } from './safelist'

export const dsInputTagConfig = defineGranularityComponentConfig(import.meta.url, {
  name: 'DsInputTag',
  dependencies: ['DsBadge', 'DsInput'],
  safelist: dsInputTagSafelist,
})