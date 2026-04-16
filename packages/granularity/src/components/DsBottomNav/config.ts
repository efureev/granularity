import { defineGranularityComponentConfig } from '../../registry/componentConfig'

import { dsBottomNavSafelist } from './safelist'

export const dsBottomNavConfig = defineGranularityComponentConfig(import.meta.url, {
  name: 'DsBottomNav',
  safelist: dsBottomNavSafelist,
})