import {defineGranularComponent} from '@feugene/unocss-preset-granular/contract'

import { grProgressBarSafelist } from './safelist'

export const grProgressBarConfig = defineGranularComponent(import.meta.url, {
  name: 'GrProgressBar',
  safelist: grProgressBarSafelist,
})