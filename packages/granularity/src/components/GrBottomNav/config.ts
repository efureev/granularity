import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

import { grBottomNavSafelist } from './safelist'

export const grBottomNavConfig = defineGranularComponent(import.meta.url, {
  name: 'GrBottomNav',
  safelist: grBottomNavSafelist,
})
