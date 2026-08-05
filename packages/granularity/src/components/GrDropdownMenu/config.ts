import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

import { grDropdownMenuSafelist } from './safelist'

export const grDropdownMenuConfig = defineGranularComponent(import.meta.url, {
  name: 'GrDropdownMenu',
  dependencies: ['GrDropdown'],
  safelist: grDropdownMenuSafelist,
})
