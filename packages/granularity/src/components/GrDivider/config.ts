import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

import { grDividerSafelist } from './safelist'

export const grDividerConfig = defineGranularComponent(import.meta.url, {
  name: 'GrDivider',
  safelist: grDividerSafelist,
})
