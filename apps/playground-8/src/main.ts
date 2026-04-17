import { createApp } from 'vue'

// foundation-слой — токены и переменные тем. Компонентные CSS-файлы
// подтягиваются автоматически резолвером `unplugin-vue-components`
// (через `sideEffects` на `@feugene/granularity/components/<Name>/styles.css`).
import '@unocss/reset/tailwind-compat.css'
import '@feugene/granularity/foundation.css'

// ВАЖНО: здесь нет ни одного импорта компонентов или директив из пакета.
// `GranularityResolver` в `vite.config.ts` подставит импорты прямо в
// транс-формированные SFC по факту использования `<DsX />` и `v-<name>`.

import App from './App.vue'
import './app.css'

createApp(App).mount('#app')
