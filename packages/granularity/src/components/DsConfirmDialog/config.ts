import {defineGranularComponent} from '@feugene/unocss-preset-granular/contract'

export const dsConfirmDialogConfig = defineGranularComponent(import.meta.url, {
    name: 'DsConfirmDialog',
    dependencies: ['DsButton', 'DsDialog'],
    safelist: [],
})