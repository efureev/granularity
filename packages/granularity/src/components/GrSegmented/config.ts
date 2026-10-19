import { defineGranumComponent } from '@feugene/granum/contract'

import { grSegmentedSafelist } from './safelist'

export const grSegmentedConfig = defineGranumComponent(import.meta.url, {
  name: 'GrSegmented',
  safelist: grSegmentedSafelist,
  themesDir: './themes',
})
