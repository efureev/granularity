import { defineGranumComponent } from '@feugene/granum/contract'

import { grFormSectionSafelist } from './safelist'

export const grFormSectionConfig = defineGranumComponent(import.meta.url, {
  name: 'GrFormSection',
  safelist: grFormSectionSafelist,
})
