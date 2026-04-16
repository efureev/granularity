import { defineGranularityComponentConfig } from '../../registry/componentConfig'

import { dsDropdownSafelist } from './safelist'

export const dsDropdownConfig = defineGranularityComponentConfig(import.meta.url, {
  name: 'DsDropdown',
  safelist: dsDropdownSafelist,
})