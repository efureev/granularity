import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

import { grScrollSpySafelist } from './safelist'

export const grScrollSpyConfig = defineGranularComponent(import.meta.url, {
  name: 'GrScrollSpy',
  safelist: grScrollSpySafelist,
})
