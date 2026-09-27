import { defineGranumComponent } from '@feugene/granum/contract'

import { grJsonViewerSafelist } from './safelist'

export const grJsonViewerConfig = defineGranumComponent(import.meta.url, {
  name: 'GrJsonViewer',
  dependencies: ['GrTree', 'GrInput', 'GrButton'],
  safelist: grJsonViewerSafelist,
})
