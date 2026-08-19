import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

import { grDurationSafelist } from './safelist'

export const grDurationConfig = defineGranularComponent(import.meta.url, {
  name: 'GrDuration',
  safelist: grDurationSafelist,
})
