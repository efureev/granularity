import {defineGranularComponent} from '@feugene/unocss-preset-granular/contract'

import { grAvatarSafelist } from './safelist'

export const grAvatarConfig = defineGranularComponent(import.meta.url, {
  name: 'GrAvatar',
  safelist: grAvatarSafelist,
})