import { defineGranumComponent } from '@feugene/granum/contract'

export const grCheckboxGroupConfig = defineGranumComponent(import.meta.url, {
  name: 'GrCheckboxGroup',
  dependencies: ['GrCheckbox'],
})
