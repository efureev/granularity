import { defineGranumComponent } from '@feugene/granum/contract'

import { grCheckboxSafelist } from './safelist'

export const grCheckboxConfig = defineGranumComponent(import.meta.url, {
  name: 'GrCheckbox',
  safelist: grCheckboxSafelist,
})
