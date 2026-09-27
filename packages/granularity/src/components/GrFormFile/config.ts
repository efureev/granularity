import { defineGranumComponent } from '@feugene/granum/contract'

import { grFormFileSafelist } from './safelist'

export const grFormFileConfig = defineGranumComponent(import.meta.url, {
  name: 'GrFormFile',
  dependencies: ['GrButton', 'GrIcon', 'GrSortableList'],
  safelist: grFormFileSafelist,
})
