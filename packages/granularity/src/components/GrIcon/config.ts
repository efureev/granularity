import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

import { grIconSafelist } from './safelist'

export const grIconConfig = defineGranularComponent(import.meta.url, {
  name: 'GrIcon',
  safelist: grIconSafelist,
})
