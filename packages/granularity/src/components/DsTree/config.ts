import { defineGranularityComponentConfig } from '../../registry/componentConfig'

import { dsTreeSafelist } from './safelist'

export const dsTreeConfig = defineGranularityComponentConfig(import.meta.url, {
  name: 'DsTree',
  safelist: dsTreeSafelist,
})