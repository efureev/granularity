import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetMini,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

import {granularContent, presetGranularNode, type PresetGranularNodeOptions} from '@feugene/unocss-preset-granular/node'
import granularityProvider from '@feugene/granularity/granular-provider/node'

export const showcaseContentIncludes = [
  /apps\/showcase\/src\/.*\.(vue|ts)($|\?)/,
]

export const showcaseGranularOptions: PresetGranularNodeOptions = {
  providers: [granularityProvider],
  components: 'all',
  themes: { names: ['light', 'dark'] },
  layer: 'granular' as const,
}

const granularContentConfig = granularContent(showcaseGranularOptions)

export default defineConfig({
  content: {
    filesystem: granularContentConfig.filesystem,
    pipeline: {
      include: [
        ...showcaseContentIncludes,
        ...granularContentConfig.pipeline.include,
      ],
    },
  },
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
