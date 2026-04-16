import { defineGranularityComponentConfig } from '../../registry/componentConfig'

import { dsBadgeWrapSafelist } from './safelist'

export const dsBadgeWrapConfig = defineGranularityComponentConfig(import.meta.url, {
  name: 'DsBadgeWrap',
  safelist: dsBadgeWrapSafelist,
})