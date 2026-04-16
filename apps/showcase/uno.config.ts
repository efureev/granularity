import {
    defineConfig,
    presetAttributify,
    presetIcons,
    presetMini,
    transformerDirectives,
    transformerVariantGroup,
} from 'unocss'

import {presetGranularityNode} from '@feugene/granularity/uno-node'

export const showcaseContentIncludes = [
    /apps\/showcase\/src\/.*\.(vue|ts)($|\?)/,
]

export default defineConfig({
    content: {
        pipeline: {
            include: showcaseContentIncludes,
        },
    },
    presets: [
        presetMini(),
        presetGranularityNode({
            themes: ['light', 'dark'],
        }),
        presetAttributify(),
        presetIcons({
            scale: 1.05,
            extraProperties: {
                display: 'inline-block',
            },
        }),
    ],
    transformers: [
        transformerDirectives(),
        transformerVariantGroup(),
    ],
})