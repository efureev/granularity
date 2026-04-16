import { defineConfig, presetMini } from 'unocss'

import { presetGranularityNode } from '@feugene/granularity/uno-node'

export const playground5ContentIncludes = [
  /apps\/playground-5\/src\/.*\.(vue|ts)($|\?)/,
]

export const playground5GranularityComponents = ['DsButton'] as const
export const playground5GranularityLayer = 'granularity'

export default defineConfig({
  content: {
    pipeline: {
      include: playground5ContentIncludes,
    },
  },
  presets: [
    presetMini(),
    presetGranularityNode({
      components: [...playground5GranularityComponents],
      layer: playground5GranularityLayer,
    }),
  ],
})
