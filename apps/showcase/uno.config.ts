import {
    defineConfig,
    presetAttributify,
    presetIcons,
    presetMini,
    transformerDirectives,
    transformerVariantGroup,
} from 'unocss'

import {granularContent, type PresetGranularNodeOptions} from '@feugene/unocss-preset-granular/node'
import {presetGranularNode} from '@feugene/unocss-preset-granular/node'
import granularityProvider from '@feugene/granularity/granular-provider/node'
import chronoProvider from '@feugene/granularity-chrono/granular-provider/node'
import chartsProvider from '@feugene/granularity-charts/granular-provider/node'

export const showcaseGranularOptions: PresetGranularNodeOptions = {
    providers: [granularityProvider, chronoProvider, chartsProvider],
    components: 'all',
    themes: {names: ['light', 'dark']},
    layer: 'granular' as const,
}

export default defineConfig({
    content: granularContent(showcaseGranularOptions),
    // Правила поверх presetMini (`animate-*`, `space-*`, `divide-*`, `backdrop-*`)
    // подмешивает сам `presetGranularNode` начиная с 0.6.1 — руками их
    // перечислять больше не нужно. Витрина держала их у себя и тем самым
    // маскировала дефект: у потребителя, собравшего конфиг по документации,
    // этих утилит не было вовсе.
    presets: [
        presetMini(),
        presetGranularNode(showcaseGranularOptions),
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
