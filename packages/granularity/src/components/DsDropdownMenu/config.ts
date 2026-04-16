import { defineGranularityComponentConfig } from '../../registry/componentConfig'

import { dsDropdownMenuSafelist } from './safelist'

export const dsDropdownMenuConfig = defineGranularityComponentConfig(import.meta.url, {
  name: 'DsDropdownMenu',
  dependencies: ['DsDropdown'],
  safelist: dsDropdownMenuSafelist,
})