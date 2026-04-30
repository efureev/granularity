import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

export const grRadioGroupConfig = defineGranularComponent(import.meta.url, {
  name: 'GrRadioGroup',
  dependencies: ['GrButtonGroup', 'GrRadio'],
  safelist: [],
})
