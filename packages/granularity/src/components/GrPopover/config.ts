import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

import { grPopoverSafelist } from './safelist'

export const grPopoverConfig = defineGranularComponent(import.meta.url, {
  name: 'GrPopover',
  safelist: grPopoverSafelist,
})
