import {defineGranularComponent} from '@feugene/unocss-preset-granular/contract'

export const grConfirmDialogConfig = defineGranularComponent(import.meta.url, {
    name: 'GrConfirmDialog',
    dependencies: ['GrButton', 'GrDialog'],
    safelist: [],
})