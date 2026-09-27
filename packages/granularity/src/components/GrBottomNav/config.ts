import { defineGranumComponent } from '@feugene/granum/contract'

import { grBottomNavSafelist } from './safelist'

export const grBottomNavConfig = defineGranumComponent(import.meta.url, {
  name: 'GrBottomNav',
  safelist: grBottomNavSafelist,
})
