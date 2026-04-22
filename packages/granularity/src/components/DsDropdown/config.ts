import {defineGranularComponent} from '@feugene/unocss-preset-granular/contract'

import { dsDropdownSafelist } from './safelist'

export const dsDropdownConfig = defineGranularComponent(import.meta.url, {
  name: 'DsDropdown',
  safelist: dsDropdownSafelist,
})