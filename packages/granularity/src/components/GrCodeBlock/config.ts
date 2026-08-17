import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

import { grCodeBlockSafelist } from './safelist'

export const grCodeBlockConfig = defineGranularComponent(import.meta.url, {
  name: 'GrCodeBlock',
  dependencies: ['GrButton'],
  safelist: grCodeBlockSafelist,
})
