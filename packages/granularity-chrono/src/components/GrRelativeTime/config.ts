import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

import { grRelativeTimeSafelist } from './safelist'

export const grRelativeTimeConfig = defineGranularComponent(import.meta.url, {
  name: 'GrRelativeTime',
  safelist: grRelativeTimeSafelist,
})
