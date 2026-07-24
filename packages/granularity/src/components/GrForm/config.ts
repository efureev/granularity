import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

export const grFormConfig = defineGranularComponent(import.meta.url, {
  name: 'GrForm',
  dependencies: ['GrFormField'],
})
