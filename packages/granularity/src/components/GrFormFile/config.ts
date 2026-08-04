import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

import { grFormFileSafelist } from './safelist'

export const grFormFileConfig = defineGranularComponent(import.meta.url, {
  name: 'GrFormFile',
  dependencies: ['GrButton', 'GrIcon'],
  safelist: grFormFileSafelist,
})
