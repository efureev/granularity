import { defineGranumComponent } from '@feugene/granum/contract'

import { grLoadingSafelist } from './safelist'

export const grLoadingConfig = defineGranumComponent(import.meta.url, {
  name: 'GrLoading',
  dependencies: ['GrIcon'],
  safelist: grLoadingSafelist,
})
