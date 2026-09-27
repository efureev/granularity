import { defineGranumComponent } from '@feugene/granum/contract'

import { grSliderSafelist } from './safelist'

export const grSliderConfig = defineGranumComponent(import.meta.url, {
  name: 'GrSlider',
  safelist: grSliderSafelist,
})
