import { fileURLToPath, URL } from 'node:url'
import { granum } from '@feugene/granum/vite'
import { GranularityResolver } from '@feugene/unplugin-granularity'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'

import granumConfig from './granum.config'
import { THEME_STORAGE_KEY } from './src/storage'

export default defineConfig({
  root: fileURLToPath(new URL('./', import.meta.url)),
  base: '/playground-theme/',
  plugins: [
    vue(),
    Components({
      dts: fileURLToPath(new URL('./src/components.d.ts', import.meta.url)),
      resolvers: GranularityResolver({ root: fileURLToPath(new URL('./', import.meta.url)) }),
      dirs: [],
    }),
    granum(granumConfig, { themeScript: { storageKey: THEME_STORAGE_KEY } }),
  ],
})
