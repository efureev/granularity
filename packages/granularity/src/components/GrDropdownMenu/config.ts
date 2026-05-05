import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

export const grDropdownMenuConfig = defineGranularComponent(import.meta.url, {
  name: 'GrDropdownMenu',
  dependencies: ['GrDropdown'],
})
