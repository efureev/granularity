import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

import { grFormFieldSafelist } from './safelist'

export const grFormFieldConfig = defineGranularComponent(import.meta.url, {
  name: 'GrFormField',
  safelist: grFormFieldSafelist,
})
