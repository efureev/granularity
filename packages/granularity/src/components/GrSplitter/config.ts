import { defineGranumComponent } from '@feugene/granum/contract'

import { grSplitterSafelist } from './safelist'

export const grSplitterConfig = defineGranumComponent(import.meta.url, {
  name: 'GrSplitter',
  safelist: grSplitterSafelist,
})
