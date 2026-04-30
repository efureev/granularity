import {defineGranularComponent} from '@feugene/unocss-preset-granular/contract'

import {grSegmentedSafelist} from './safelist'

export const grSegmentedConfig = defineGranularComponent(import.meta.url, {
    name: 'GrSegmented',
    safelist: grSegmentedSafelist,
    tokenDefinitions: {
        light: {
            selector: ':root',
            tokens: {'ds-segmented-indicator-highlight-shadow': '0 0 0 0 transparent'}
        },
        dark: {
            selector: '.dark',
            tokens: {'ds-segmented-indicator-highlight-shadow': '0 0 0 1px rgba(248, 250, 252, 0.08)'}
        },
    }
})