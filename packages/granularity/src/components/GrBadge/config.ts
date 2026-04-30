import {defineGranularComponent} from '@feugene/unocss-preset-granular/contract'

import { grBadgeSafelist } from './safelist'

export const grBadgeConfig = defineGranularComponent(import.meta.url, {
  name: 'GrBadge',
  safelist: grBadgeSafelist,
})