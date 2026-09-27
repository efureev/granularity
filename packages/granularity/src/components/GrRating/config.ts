import { defineGranumComponent } from '@feugene/granum/contract'

import { grRatingSafelist } from './safelist'

export const grRatingConfig = defineGranumComponent(import.meta.url, {
  name: 'GrRating',
  safelist: grRatingSafelist,
})
