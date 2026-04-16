import { defineGranularityComponentConfig } from '../../registry/componentConfig'

import { dsListSafelist } from './safelist'

export const dsListConfig = defineGranularityComponentConfig(import.meta.url, {
  name: 'DsList',
  safelist: dsListSafelist,
  dependencies: ['DsCard'],
})