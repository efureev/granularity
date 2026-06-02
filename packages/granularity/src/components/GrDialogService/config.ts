import {defineGranularComponent} from '@feugene/unocss-preset-granular/contract'

export const grDialogServiceConfig = defineGranularComponent(import.meta.url, {
    name: 'GrDialogServiceHost',
    dependencies: ['GrButton', 'GrDialog', 'GrConfirmDialog', 'GrPromptDialog', 'GrResponseErrorBanner'],
})
