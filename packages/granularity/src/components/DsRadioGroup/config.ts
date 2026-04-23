import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

export const dsRadioGroupConfig = defineGranularComponent(import.meta.url, {
  name: 'DsRadioGroup',
  dependencies: ['DsButtonGroup', 'DsRadio'],
  safelist: [],
})
