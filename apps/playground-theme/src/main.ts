import { createApp } from 'vue'

import App from './App.vue'

// Порядок импортов задан явно (последовательные `await`, а не `Promise.all`):
// сначала reset, затем весь CSS granum одним модулем, затем темы приложения.
// Конфликта селекторов у `[data-theme='ocean']` с пакетными темами нет —
// значения атрибута разные, — но порядок стоит держать предсказуемым.
// Отдельной entry под утилиты приложения больше нет: они лежат в слое
// `granum.utilities` того же модуля.
await import('./reset')
await import('./granularity')
await import('./styles/theme-ocean.css')
await import('./styles/theme-contrast.css')

createApp(App).mount('#app')
