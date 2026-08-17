import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

import { grDeltaSafelist } from './safelist'

export const grDeltaConfig = defineGranularComponent(import.meta.url, {
  name: 'GrDelta',
  safelist: grDeltaSafelist,
})
