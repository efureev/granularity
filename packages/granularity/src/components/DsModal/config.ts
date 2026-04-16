import { defineGranularityComponentConfig } from '../../registry/componentConfig'

import { dsModalSafelist } from './safelist'

export const dsModalConfig = defineGranularityComponentConfig(import.meta.url, {
  name: 'DsModal',
  safelist: dsModalSafelist,
})