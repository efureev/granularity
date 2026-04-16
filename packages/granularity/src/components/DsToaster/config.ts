import { defineGranularityComponentConfig } from '../../registry/componentConfig'

import { dsToasterSafelist } from './safelist'

export const dsToasterConfig = defineGranularityComponentConfig(import.meta.url, {
  name: 'DsToaster',
  dependencies: ['DsButton'],
  safelist: dsToasterSafelist,
})