import {fileURLToPath, URL} from 'node:url'
import {
    defineConfig,
    presetAttributify,
    presetIcons,
    presetMini,
    transformerDirectives,
    transformerVariantGroup,
    // transformerCompileClass,
} from 'unocss'

import {presetGranularityNode} from '@feugene/granularity/uno-node'

export const distPlaygroundContentIncludes = [
    /apps\/playground\/src\/.*\.(vue|ts)($|\?)/,
]

const granularPresetComponents = ['DsButton'] as const
// const granularPresetComponents = ['DsPromptDialog'] as const
// const granularPresetThemes = ['light', 'dark'] as const

const granularPresetThemeFiles = [
    fileURLToPath(new URL('./src/styles/light-app.css', import.meta.url)),
] as const

export default defineConfig({
    content: {
        // Only scan demo source files. Do not scan `dist`, otherwise missing library styles can be masked.
        pipeline: {
            include: distPlaygroundContentIncludes,
        },
    },
    presets: [
        presetMini(),
        presetGranularityNode({
            components: [...granularPresetComponents],
            // components: 'all',
            // themes: [...granularPresetThemes],
            themeFiles: [...granularPresetThemeFiles],
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