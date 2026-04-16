import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export const playground2GranularityDistDir = fileURLToPath(new URL('../../packages/granularity/dist/', import.meta.url))
export const playground2VueChunkGroup = {
  name: 'vue',
  test: /node_modules[\\/](?:vue|@vue)[\\/]/,
  priority: 2,
}
export const playground2GranularityChunkGroup = {
  name: 'granularity',
  test: (id: string) => id.startsWith(playground2GranularityDistDir),
  priority: 1,
}

export default defineConfig({
  root: fileURLToPath(new URL('./', import.meta.url)),
  base: '/playground-2/',
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            playground2VueChunkGroup,
            playground2GranularityChunkGroup,
          ],
        },
      },
    },
  },
  plugins: [vue()],
})
