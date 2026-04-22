import { defineConfig, presetMini } from 'unocss'
import { presetGranularNode } from '@feugene/unocss-preset-granular/node'
import granularityProvider from '@feugene/granularity/granular-provider/node'

export const playground5ContentIncludes = [
  /apps\/playground-5\/src\/.*\.(vue|ts)($|\?)/,
]
export const playground5GranularityComponents = ['DsButton'] as const
export const playground5GranularityLayer = 'granular'

export default defineConfig({
  content: {
    pipeline: {
      include: playground5ContentIncludes,
    },
  },
  presets: [
    presetMini(),
    presetGranularNode({
      providers: [granularityProvider],
      components: [
        {
          provider: '@feugene/granularity',
          names: [...playground5GranularityComponents],
        },
      ],
      layer: playground5GranularityLayer,
    }),
  ],
})
