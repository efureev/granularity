import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

import { grRadioSafelist } from './safelist'

export const grRadioConfig = defineGranularComponent(import.meta.url, {
  name: 'GrRadio',
  dependencies: ['GrButton'],
  safelist: grRadioSafelist,
})