import { defineGranumComponent } from '@feugene/granum/contract'

import { grScrollSpySafelist } from './safelist'

export const grScrollSpyConfig = defineGranumComponent(import.meta.url, {
  name: 'GrScrollSpy',
  safelist: grScrollSpySafelist,
})
