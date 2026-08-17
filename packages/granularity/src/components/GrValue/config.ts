import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

import { grValueSafelist } from './safelist'

export const grValueConfig = defineGranularComponent(import.meta.url, {
  name: 'GrValue',
  safelist: grValueSafelist,
})
