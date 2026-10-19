import { fileURLToPath, URL } from 'node:url'
import { granum } from '@feugene/granum/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

import { GR_THEME_STORAGE_KEY } from '@feugene/granularity/composables/useTheme'

import granumConfig from './granum.config'

export default defineConfig({
  root: fileURLToPath(new URL('./', import.meta.url)),
  base: '/playground-ssr/',
  plugins: [
    vue(),
    // Скрипт в `<head>` ставит пару до первого кадра, когда сервер режима не
    // знает (cookie нет): из `localStorage`, иначе по системной схеме. Пару,
    // уже пришедшую с сервера, он не трогает.
    granum(granumConfig, { themeScript: { storageKey: GR_THEME_STORAGE_KEY, cookie: GR_THEME_STORAGE_KEY } }),
  ],
})
