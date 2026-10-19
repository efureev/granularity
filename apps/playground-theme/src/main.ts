import { createApp } from 'vue'

import { granularityThemePlugin } from '@feugene/granularity'
import themeManifest from 'virtual:granum/themes'

import App from './App.vue'
import { THEME_STORAGE_KEY } from './storage'

// Сначала reset, затем весь CSS granum одним модулем: режимы темы и превью в
// нём же, отдельного CSS приложения под них нет.
await import('./reset')
await import('./granularity')

createApp(App)
  .use(granularityThemePlugin, { manifest: themeManifest, storageKey: THEME_STORAGE_KEY })
  .mount('#app')
