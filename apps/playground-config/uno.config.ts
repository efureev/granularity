import { defineConfig, presetMini } from 'unocss'
import {
    granularContent,
    presetGranularNode,
    type PresetGranularNodeOptions,
} from '@feugene/unocss-preset-granular/node'
import granularityProvider from '@feugene/granularity/granular-provider/node'

// Ровно те компоненты, которые импортирует приложение, — гранулярность проверяем
// заодно: конфиг-дефолты не должны тянуть в CSS ничего лишнего.
export const playgroundConfigComponents = ['GrButton', 'GrInput', 'GrBadge', 'GrConfigProvider'] as const

const granularOptions: PresetGranularNodeOptions = {
    providers: [granularityProvider],
    components: [
        {
            provider: '@feugene/granularity',
            names: [...playgroundConfigComponents],
        },
    ],
    layer: 'granular',
}

export default defineConfig({
    content: granularContent(granularOptions),
    presets: [
        presetMini(),
        presetGranularNode(granularOptions),
    ],
})
