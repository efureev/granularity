import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

import { grSliderSafelist } from './safelist'

export const grSliderConfig = defineGranularComponent(import.meta.url, {
  name: 'GrSlider',
  safelist: grSliderSafelist,
})
