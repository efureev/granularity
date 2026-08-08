import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

import { grCheckboxSafelist } from './safelist'

export const grCheckboxConfig = defineGranularComponent(import.meta.url, {
  name: 'GrCheckbox',
  safelist: grCheckboxSafelist,
})
