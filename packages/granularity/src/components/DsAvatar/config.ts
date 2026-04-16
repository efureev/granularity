import { defineGranularityComponentConfig } from '../../registry/componentConfig'

import { dsAvatarSafelist } from './safelist'

export const dsAvatarConfig = defineGranularityComponentConfig(import.meta.url, {
  name: 'DsAvatar',
  safelist: dsAvatarSafelist,
})