import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

import { grToasterSafelist } from './safelist'

export const grToasterConfig = defineGranularComponent(import.meta.url, {
  name: 'GrToaster',
  dependencies: ['GrButton', 'GrIcon'],
  safelist: grToasterSafelist,
})
