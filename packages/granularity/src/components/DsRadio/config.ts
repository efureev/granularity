import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

import { dsRadioSafelist } from './safelist'

export const dsRadioConfig = defineGranularComponent(import.meta.url, {
  name: 'DsRadio',
  dependencies: ['DsButton'],
  safelist: dsRadioSafelist,
})