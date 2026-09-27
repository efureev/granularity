import { defineGranumComponent } from '@feugene/granum/contract'

import { grBadgeWrapSafelist } from './safelist'

export const grBadgeWrapConfig = defineGranumComponent(import.meta.url, {
  name: 'GrBadgeWrap',
  safelist: grBadgeWrapSafelist,
})
