import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

import { grDescriptionListSafelist } from './safelist'

export const grDescriptionListConfig = defineGranularComponent(import.meta.url, {
  name: 'GrDescriptionList',
  safelist: grDescriptionListSafelist,
})
