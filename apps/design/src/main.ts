import { createApp } from 'vue'

import { initThemeEarly } from '@feugene/granularity'

import './styles/reset.css'
import 'virtual:granum.css'

import App from './app/App.vue'
import { router } from './app/router'
import { THEME_STORAGE_KEY } from './app/theme'

initThemeEarly({ storageKey: THEME_STORAGE_KEY })

createApp(App).use(router).mount('#app')
