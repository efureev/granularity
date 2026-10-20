import { createApp } from 'vue'

import App from './App.vue'

// Сначала сброс, затем CSS granum: слой встаёт в каскад по первому появлению,
// и `reset` обязан оказаться раньше слоёв granum. Параллельная загрузка в dev
// вставила бы стили в порядке исполнения модулей, а он не гарантирован.
await import('./reset')
await import('./granularity')

createApp(App).mount('#app')
