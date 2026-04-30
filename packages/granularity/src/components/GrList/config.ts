import {defineGranularComponent} from '@feugene/unocss-preset-granular/contract'

export const grListConfig = defineGranularComponent(import.meta.url, {
    name: 'GrList',
    safelist: [
        // GrListItem density
        'px-4',
        'py-2',
        'py-3',
    ],
    dependencies: ['GrCard'],
})