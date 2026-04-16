import { defineGranularityComponentConfig } from '../../registry/componentConfig'

import { dsAlertSafelist } from './safelist'

export const dsAlertConfig = defineGranularityComponentConfig(import.meta.url, {
  name: 'DsAlert',
  safelist: dsAlertSafelist,
})