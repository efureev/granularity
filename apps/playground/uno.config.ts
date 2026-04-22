import { fileURLToPath, URL } from 'node:url'
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

export const distPlaygroundContentIncludes = [
  /apps\/playground\/src\/.*\.(vue|ts)($|\?)/,
]

const granularPresetComponents = ['DsButton'] as const

const granularPresetThemeFiles = [
  fileURLToPath(new URL('./src/styles/light-app.css', import.meta.url)),
] as const

export default defineConfig({
  content: {
    pipeline: {
      include: distPlaygroundContentIncludes,
    },
  },
  presets: [
    presetMini(),
    presetGranularNode({
      providers: [granularityProvider],
      components: [
        { provider: '@feugene/granularity', names: [...granularPresetComponents] },
      ],
      themes: {
        // Приложение явно добавляет свой CSS с токенами как override tokens.css провайдера
        tokensFile: granularPresetThemeFiles[0],
      },
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
