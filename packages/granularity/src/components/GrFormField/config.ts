import { defineGranumComponent } from '@feugene/granum/contract'

import { grFormFieldSafelist } from './safelist'

export const grFormFieldConfig = defineGranumComponent(import.meta.url, {
  name: 'GrFormField',
  safelist: grFormFieldSafelist,
})
