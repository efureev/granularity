import {defineGranularComponent} from '@feugene/unocss-preset-granular/contract'

import { dsProgressBarSafelist } from './safelist'

export const dsProgressBarConfig = defineGranularComponent(import.meta.url, {
  name: 'DsProgressBar',
  safelist: dsProgressBarSafelist,
})