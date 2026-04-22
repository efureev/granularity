import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetMini,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

import { presetGranularNode } from '@feugene/unocss-preset-granular/node'
import granularityProvider from '@feugene/granularity/granular-provider/node'

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
    presetGranularNode({
      providers: [granularityProvider],
      themes: { names: ['light', 'dark'] },
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
