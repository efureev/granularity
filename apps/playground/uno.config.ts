import {fileURLToPath, URL} from 'node:url'
import {
    defineConfig,
    presetAttributify,
    presetIcons,
    presetMini,
    transformerDirectives,
    transformerVariantGroup,
} from 'unocss'

import {
    granularContent,
    presetGranularNode,
    type PresetGranularNodeOptions,
} from '@feugene/unocss-preset-granular/node'
import granularityProvider from '@feugene/granularity/granular-provider/node'

const granularPresetComponents = ['GrButton'] as const

const granularPresetThemeFiles = [
    fileURLToPath(new URL('./src/styles/light-app.css', import.meta.url)),
] as const

const granularOptions: PresetGranularNodeOptions = {
    providers: [granularityProvider],
    components: [
        {provider: '@feugene/granularity', names: [...granularPresetComponents]},
    ],
    themes: {
        // Приложение явно добавляет свой CSS с токенами как override tokens.css провайдера
        tokensFile: granularPresetThemeFiles[0],
    },
}

export default defineConfig({
    content: granularContent(granularOptions),
    presets: [
        presetMini(),
        presetGranularNode(granularOptions),
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
