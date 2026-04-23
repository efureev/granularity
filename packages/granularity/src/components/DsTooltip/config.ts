import {defineGranularComponent} from '@feugene/unocss-preset-granular/contract'

export const dsTooltipConfig = defineGranularComponent(import.meta.url, {
    name: 'DsTooltip',
    dependencies: ['DsIcon'],
    safelist: [],
})
