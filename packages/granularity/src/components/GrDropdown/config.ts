import {defineGranularComponent} from '@feugene/unocss-preset-granular/contract'

import { grDropdownSafelist } from './safelist'

export const grDropdownConfig = defineGranularComponent(import.meta.url, {
  name: 'GrDropdown',
  safelist: grDropdownSafelist,
})