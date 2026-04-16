import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export const playground4GranularityDistDir = fileURLToPath(new URL('../../packages/granularity/dist/', import.meta.url))
export const playground4VueChunkGroup = {
  name: 'vue',
  test: /node_modules[\\/](?:vue|@vue)[\\/]/,
  priority: 2,
}
export const playground4GranularityChunkGroup = {
  name: 'granularity',
  test: (id: string) => id.startsWith(playground4GranularityDistDir),
  priority: 1,
}

export default defineConfig({
  root: fileURLToPath(new URL('./', import.meta.url)),
  base: '/playground-4/',
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            playground4VueChunkGroup,
            playground4GranularityChunkGroup,
          ],
        },
      },
    },
  },
  plugins: [vue()],
})
