import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

export const grCheckboxGroupConfig = defineGranularComponent(import.meta.url, {
  name: 'GrCheckboxGroup',
  dependencies: ['GrCheckbox'],
})
