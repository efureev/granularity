import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

import { grKbdSafelist } from './safelist'

export const grKbdConfig = defineGranularComponent(import.meta.url, {
  name: 'GrKbd',
  safelist: grKbdSafelist,
})
