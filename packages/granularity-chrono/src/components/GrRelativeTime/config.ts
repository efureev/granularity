import { defineGranumComponent } from '@feugene/granum/contract'

import { grRelativeTimeSafelist } from './safelist'

export const grRelativeTimeConfig = defineGranumComponent(import.meta.url, {
  name: 'GrRelativeTime',
  safelist: grRelativeTimeSafelist,
})
