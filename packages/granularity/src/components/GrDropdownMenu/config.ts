import { defineGranumComponent } from '@feugene/granum/contract'

import { grDropdownMenuSafelist } from './safelist'

export const grDropdownMenuConfig = defineGranumComponent(import.meta.url, {
  name: 'GrDropdownMenu',
  dependencies: ['GrDropdown', 'GrPopover'],
  safelist: grDropdownMenuSafelist,
})
