import { defineGranularityComponentConfig } from '../../registry/componentConfig'

import { dsCollapseSafelist } from './safelist'

export const dsCollapseConfig = defineGranularityComponentConfig(import.meta.url, {
  name: 'DsCollapse',
  safelist: dsCollapseSafelist,
  dependencies: ['DsCard'],
})