import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export const playground7GranularityDistDir = fileURLToPath(
  new URL('../../packages/granularity/dist/', import.meta.url),
)

export const playground7VueChunkGroup = {
  name: 'vue',
  test: /node_modules[\\/](?:vue|@vue)[\\/]/,
  priority: 2,
}

export const playground7GranularityChunkGroup = {
  name: 'granularity',
  test: (id: string) => id.startsWith(playground7GranularityDistDir),
  priority: 1,
}

export default defineConfig({
  root: fileURLToPath(new URL('./', import.meta.url)),
  base: '/playground-7/',
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            playground7VueChunkGroup,
            playground7GranularityChunkGroup,
          ],
        },
      },
    },
  },
  plugins: [vue()],
})
