import { defineConfig, presetMini } from 'unocss'

import { presetGranularityNode } from './src/unocss/preset.node'

export const granularityContentIncludes = [
  /packages\/granularity\/src\/.*\.(vue|ts)($|\?)/,
]

export default defineConfig({
  content: {
    pipeline: {
      include: granularityContentIncludes,
    },
  },
  presets: [
    presetMini(),
    presetGranularityNode(),
  ],
})