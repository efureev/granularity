import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

import { grFormSectionSafelist } from './safelist'

export const grFormSectionConfig = defineGranularComponent(import.meta.url, {
  name: 'GrFormSection',
  safelist: grFormSectionSafelist,
})
