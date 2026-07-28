import { createApp } from 'vue'

import App from './App.vue'

// Порядок импортов задан явно (последовательные `await`, а не `Promise.all`):
// сначала reset, затем foundation-слой пакета, затем тема приложения, затем
// утилиты. Конфликта селекторов у `[data-theme='ocean']` с пакетными темами нет
// (разные значения атрибута), но порядок стоит держать предсказуемым.
await import('./reset')
await import('./granularity')
await import('./styles/theme-ocean.css')
await import('./app-styles')

createApp(App).mount('#app')
