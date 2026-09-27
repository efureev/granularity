import { defineGranumComponent } from '@feugene/granum/contract'

export const grFormConfig = defineGranumComponent(import.meta.url, {
  name: 'GrForm',
  dependencies: ['GrFormField'],
})
