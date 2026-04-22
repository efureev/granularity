import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

import { dsToasterSafelist } from './safelist'

export const dsToasterConfig = defineGranularComponent(import.meta.url, {
  name: 'DsToaster',
  dependencies: ['DsButton', 'DsIcon'],
  safelist: dsToasterSafelist,
})
