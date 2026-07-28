import { defineConfig, presetMini } from 'unocss'
import {
  granularContent,
  presetGranularNode,
  type PresetGranularNodeOptions,
} from '@feugene/unocss-preset-granular/node'
import granularityProvider from '@feugene/granularity/granular-provider/node'

const granularOptions: PresetGranularNodeOptions = {
  providers: [granularityProvider],
  themes: { names: ['light', 'dark'] },
  layer: 'granular',
}

export default defineConfig({
  content: granularContent(granularOptions),
  presets: [
    presetMini(),
    presetGranularNode(granularOptions),
  ],
})
