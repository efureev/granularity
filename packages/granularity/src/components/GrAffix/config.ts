import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

import { grAffixSafelist } from './safelist'

export const grAffixConfig = defineGranularComponent(import.meta.url, {
  name: 'GrAffix',
  safelist: grAffixSafelist,
})
