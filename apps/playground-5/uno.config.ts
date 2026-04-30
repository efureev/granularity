import {defineConfig, presetMini} from 'unocss'
import {
    granularContent,
    presetGranularNode,
    type PresetGranularNodeOptions,
} from '@feugene/unocss-preset-granular/node'
import granularityProvider from '@feugene/granularity/granular-provider/node'

export const playground5GranularityComponents = ['GrButton'] as const
export const playground5GranularityLayer = 'granular'

const granularOptions: PresetGranularNodeOptions = {
    providers: [granularityProvider],
    components: [
        {
            provider: '@feugene/granularity',
            names: [...playground5GranularityComponents],
        },
    ],
    layer: playground5GranularityLayer,
}

export default defineConfig({
    content: granularContent(granularOptions),
    presets: [
        presetMini(),
        presetGranularNode(granularOptions),
    ],
})
