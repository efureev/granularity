import { defineGranularityComponentConfig } from '../../registry/componentConfig'

import { dsTextareaSafelist } from './safelist'

export const dsTextareaConfig = defineGranularityComponentConfig(import.meta.url, {
  name: 'DsTextarea',
  safelist: dsTextareaSafelist,
})