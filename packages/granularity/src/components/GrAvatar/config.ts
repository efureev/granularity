import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

import { grAvatarSafelist } from './safelist'

export const grAvatarConfig = defineGranularComponent(import.meta.url, {
  name: 'GrAvatar',
  dependencies: ['GrSkeleton'],
  safelist: grAvatarSafelist,
  // Только светлая: слоты палитры ссылаются на `-light`/`-text`, а те
  // переключаются вместе с темой сами — см. комментарий в самом файле.
  tokenDefinitionsRef: {
    light: { url: './themes/light.css', selector: ':root' },
  },
})
