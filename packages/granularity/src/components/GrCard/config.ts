import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

import { grCardSafelist } from './safelist'

export const grCardConfig = defineGranularComponent(import.meta.url, {
  name: 'GrCard',
  safelist: grCardSafelist,
})
