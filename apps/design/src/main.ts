import { createApp } from 'vue'

import { initThemeEarly } from '@feugene/granularity'
import themeManifest from 'virtual:granum/themes'

import './styles/reset.css'
import 'virtual:granum.css'
// Дополнительные темы приложение показывает всегда: их листы — сразу, без кадра без значений.
import 'virtual:granum/themes.css'

import App from './app/App.vue'
import { followDocumentTheme, router } from './app/router'
import { THEME_STORAGE_KEY } from './app/theme'

// Пара сохранённого выбора — до первого кадра; тему адреса включает роутер до отрисовки страницы.
initThemeEarly({ manifest: themeManifest, storageKey: THEME_STORAGE_KEY })
followDocumentTheme()

createApp(App).use(router).mount('#app')
