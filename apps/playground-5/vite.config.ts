import { fileURLToPath, URL } from 'node:url'
import { granum } from '@feugene/granum/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

import granumConfig from './granum.config'

export const playground5GranularityDistDir = fileURLToPath(new URL('../../packages/granularity/dist/', import.meta.url))
export const playground5VueChunkGroup = {
  name: 'vue',
  test: /node_modules[\\/](?:vue|@vue)[\\/]/,
  priority: 3,
}
export const playground5ResetChunkGroup = {
  name: 'reset',
  test: /node_modules[\\/]@unocss[\\/]reset[\\/]/,
  priority: 1,
}
export const playground5GranularityChunkGroup = {
  name: 'granularity',
  test: (id: string) => id.startsWith(playground5GranularityDistDir),
  priority: 2,
}

export default defineConfig({
  root: fileURLToPath(new URL('./', import.meta.url)),
  base: '/playground-5/',
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            playground5VueChunkGroup,
            playground5ResetChunkGroup,
            playground5GranularityChunkGroup,
          ],
        },
      },
    },
  },
  plugins: [
    vue(),
    granum(granumConfig),
  ],
})
