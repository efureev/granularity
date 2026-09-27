import { defineGranumComponent } from '@feugene/granum/contract'

import { grTextareaSafelist } from './safelist'

export const grTextareaConfig = defineGranumComponent(import.meta.url, {
  name: 'GrTextarea',
  safelist: grTextareaSafelist,
})
