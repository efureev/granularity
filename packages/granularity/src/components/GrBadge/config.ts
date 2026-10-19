import { defineGranumComponent } from '@feugene/granum/contract'

import { grBadgeSafelist } from './safelist'

export const grBadgeConfig = defineGranumComponent(import.meta.url, {
  name: 'GrBadge',
  safelist: grBadgeSafelist,
  themesDir: './themes',
})
