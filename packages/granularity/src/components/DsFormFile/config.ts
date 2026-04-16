import { defineGranularityComponentConfig } from '../../registry/componentConfig'

import { dsFormFileSafelist } from './safelist'

export const dsFormFileConfig = defineGranularityComponentConfig(import.meta.url, {
  name: 'DsFormFile',
  dependencies: ['DsButton'],
  safelist: dsFormFileSafelist,
})