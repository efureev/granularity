import {defineGranularComponent} from '@feugene/unocss-preset-granular/contract'

import { dsBottomNavSafelist } from './safelist'

export const dsBottomNavConfig = defineGranularComponent(import.meta.url, {
  name: 'DsBottomNav',
  safelist: dsBottomNavSafelist,
})