import {defineGranularComponent} from '@feugene/unocss-preset-granular/contract'

export const dsListConfig = defineGranularComponent(import.meta.url, {
    name: 'DsList',
    safelist: [
        // DsListItem density
        'px-4',
        'py-2',
        'py-3',
    ],
    dependencies: ['DsCard'],
})