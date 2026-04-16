import { defineGranularityComponentConfig } from '../../registry/componentConfig'

import { dsEmptyStateSafelist } from './safelist'

export const dsEmptyStateConfig = defineGranularityComponentConfig(import.meta.url, {
  name: 'DsEmptyState',
  safelist: dsEmptyStateSafelist,
})