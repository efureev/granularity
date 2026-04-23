import {defineGranularComponent} from '@feugene/unocss-preset-granular/contract'

import { dsBadgeSafelist } from './safelist'

export const dsBadgeConfig = defineGranularComponent(import.meta.url, {
  name: 'DsBadge',
  safelist: dsBadgeSafelist,
})