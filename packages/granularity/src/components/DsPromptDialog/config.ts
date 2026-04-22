import {defineGranularComponent} from '@feugene/unocss-preset-granular/contract'

export const dsPromptDialogConfig = defineGranularComponent(import.meta.url, {
    name: 'DsPromptDialog',
    dependencies: ['DsButton', 'DsDialog', 'DsFormField', 'DsInput'],
    safelist: [],
})