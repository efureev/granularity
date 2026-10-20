import { createApp } from 'vue'

import { granularityThemePlugin } from '@feugene/granularity'
import themeManifest from 'virtual:granum/themes'

import App from './App.vue'
import { THEME_STORAGE_KEY } from './storage'

// Сначала reset, затем CSS granum: общий лист с режимами основной темы и листы
// дополнительных тем — отдельного CSS приложения под них нет.
await import('./reset')
await import('./granularity')

createApp(App)
  .use(granularityThemePlugin, { manifest: themeManifest, storageKey: THEME_STORAGE_KEY })
  .mount('#app')
