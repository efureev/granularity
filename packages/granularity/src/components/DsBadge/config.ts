import { defineGranularityComponentConfig } from '../../registry/componentConfig'

import { dsBadgeSafelist } from './safelist'

export const dsBadgeConfig = defineGranularityComponentConfig(import.meta.url, {
  name: 'DsBadge',
  safelist: dsBadgeSafelist,
})