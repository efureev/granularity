import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

import { grBadgeWrapSafelist } from './safelist'

export const grBadgeWrapConfig = defineGranularComponent(import.meta.url, {
  name: 'GrBadgeWrap',
  safelist: grBadgeWrapSafelist,
})
