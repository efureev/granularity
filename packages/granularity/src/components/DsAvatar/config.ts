import {defineGranularComponent} from '@feugene/unocss-preset-granular/contract'

import { dsAvatarSafelist } from './safelist'

export const dsAvatarConfig = defineGranularComponent(import.meta.url, {
  name: 'DsAvatar',
  safelist: dsAvatarSafelist,
})