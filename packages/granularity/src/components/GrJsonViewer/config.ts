import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

import { grJsonViewerSafelist } from './safelist'

export const grJsonViewerConfig = defineGranularComponent(import.meta.url, {
  name: 'GrJsonViewer',
  dependencies: ['GrTree', 'GrInput', 'GrButton'],
  safelist: grJsonViewerSafelist,
})
