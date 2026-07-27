import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

import { grRatingSafelist } from './safelist'

export const grRatingConfig = defineGranularComponent(import.meta.url, {
  name: 'GrRating',
  safelist: grRatingSafelist,
})
