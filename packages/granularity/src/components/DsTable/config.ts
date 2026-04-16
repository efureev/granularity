import { defineGranularityComponentConfig } from '../../registry/componentConfig'

import { dsTableSafelist } from './safelist'

export const dsTableConfig = defineGranularityComponentConfig(import.meta.url, {
  name: 'DsTable',
  safelist: dsTableSafelist,
})