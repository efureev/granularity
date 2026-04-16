import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export const playground3GranularityDistDir = fileURLToPath(new URL('../../packages/granularity/dist/', import.meta.url))
export const playground3VueChunkGroup = {
  name: 'vue',
  test: /node_modules[\\/](?:vue|@vue)[\\/]/,
  priority: 2,
}
export const playground3GranularityChunkGroup = {
  name: 'granularity',
  test: (id: string) => id.startsWith(playground3GranularityDistDir),
  priority: 1,
}

export default defineConfig({
  root: fileURLToPath(new URL('./', import.meta.url)),
  base: '/playground-3/',
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            playground3VueChunkGroup,
            playground3GranularityChunkGroup,
          ],
        },
      },
    },
  },
  plugins: [vue()],
})
