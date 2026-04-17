import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'

// Готовый резолвер пакета: отдельный build-time пакет `@feugene/unplugin-granularity`.
// `@feugene/granularity` остаётся чисто рантайм-библиотекой без зависимости на
// `unplugin-vue-components`. Резолвер резолвит компоненты `Ds*` в
// `@feugene/granularity/components/<Name>` и директивы (`v-hotkey`, `v-click-outside`, …)
// в соответствующие sub-path — поэтому tree-shaking сохраняется.
import { GranularityResolver } from '@feugene/unplugin-granularity'

export const playground8GranularityDistDir = fileURLToPath(
  new URL('../../packages/granularity/dist/', import.meta.url),
)

export const playground8VueChunkGroup = {
  name: 'vue',
  test: /node_modules[\\/](?:vue|@vue)[\\/]/,
  priority: 2,
}

export const playground8GranularityChunkGroup = {
  name: 'granularity',
  test: (id: string) => id.startsWith(playground8GranularityDistDir),
  priority: 1,
}

export default defineConfig({
  root: fileURLToPath(new URL('./', import.meta.url)),
  base: '/playground-8/',
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            playground8VueChunkGroup,
            playground8GranularityChunkGroup,
          ],
        },
      },
    },
  },
  plugins: [
    vue(),
    Components({
      dts: fileURLToPath(new URL('./components.d.ts', import.meta.url)),
      resolvers: [GranularityResolver()],
    }),
  ],
})
