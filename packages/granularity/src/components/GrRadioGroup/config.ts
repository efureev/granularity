import { defineGranumComponent } from '@feugene/granum/contract'

export const grRadioGroupConfig = defineGranumComponent(import.meta.url, {
  name: 'GrRadioGroup',
  dependencies: ['GrButtonGroup', 'GrRadio'],
})
