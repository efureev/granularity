import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import Icons from 'unplugin-icons/vite'
import { defineConfig } from 'vitest/config'

const granularityDistRoot = fileURLToPath(new URL('../../packages/granularity/dist', import.meta.url))
const granularityDistEntry = fileURLToPath(new URL('../../packages/granularity/dist/index.js', import.meta.url))

export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^@feugene\/granularity$/,
        replacement: granularityDistEntry,
      },
      {
        find: /^@feugene\/granularity\/granular-provider\/node$/,
        replacement: `${granularityDistRoot}/granular-provider-node.js`,
      },
      {
        find: /^@feugene\/granularity\/granular-provider$/,
        replacement: `${granularityDistRoot}/granular-provider.js`,
      },
      {
        find: /^@feugene\/granularity\/(.*)$/,
        replacement: `${granularityDistRoot}/$1`,
      },
    ],
  },
  plugins: [
    vue(),
    Icons({
      compiler: 'vue3',
      autoInstall: false,
    }),
  ],
  root: fileURLToPath(new URL('./', import.meta.url)),
  test: {
    environment: 'node',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
})