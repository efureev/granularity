import {defineGranularComponent} from '@feugene/unocss-preset-granular/contract'

export const grPromptDialogConfig = defineGranularComponent(import.meta.url, {
    name: 'GrPromptDialog',
    dependencies: ['GrButton', 'GrDialog', 'GrFormField', 'GrInput'],
    safelist: [],
})