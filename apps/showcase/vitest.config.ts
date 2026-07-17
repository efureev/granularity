import { readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import Icons from 'unplugin-icons/vite'
import { defineConfig } from 'vitest/config'

const granularityDistRoot = fileURLToPath(new URL('../../packages/granularity/dist', import.meta.url))
const granularityDistEntry = fileURLToPath(new URL('../../packages/granularity/dist/index.js', import.meta.url))

const granularityPackageJson = fileURLToPath(new URL('../../packages/granularity/package.json', import.meta.url))
const granularityVersion = JSON.parse(readFileSync(granularityPackageJson, 'utf-8')).version as string

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
  define: {
    __GRANULARITY_VERSION__: JSON.stringify(granularityVersion),
  },
  test: {
    environment: 'node',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
})