import { createApp } from 'vue'

import App from './App.vue'

await Promise.all([
  import('./reset'),
  import('./granularity'),
])

createApp(App).mount('#app')
