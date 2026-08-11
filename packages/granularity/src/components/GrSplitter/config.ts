import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

import { grSplitterSafelist } from './safelist'

export const grSplitterConfig = defineGranularComponent(import.meta.url, {
  name: 'GrSplitter',
  safelist: grSplitterSafelist,
})
