import {defineGranularComponent} from '@feugene/unocss-preset-granular/contract'

export const grTooltipConfig = defineGranularComponent(import.meta.url, {
    name: 'GrTooltip',
    dependencies: ['GrIcon'],
    safelist: [],
})
