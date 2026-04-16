import { defineGranularityComponentConfig } from '../../registry/componentConfig'

import { dsDataTableSafelist } from './safelist'

export const dsDataTableConfig = defineGranularityComponentConfig(import.meta.url, {
  name: 'DsDataTable',
  safelist: dsDataTableSafelist,
  dependencies: ['DsTable'],
})