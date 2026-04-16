import {createApp} from 'vue'

import App from './App.vue'

// Вариант 1: foundation-only слой пакета.
// import '@granularity-foundation'
// import './styles/light-app.css'

// Вариант 2: полный пакетный CSS.
// import '@granularity-styles'
// import './styles/light-app.css'

// Вариант 3: granular-подключение только кнопки.
// В built `@granularity-button-css` уже включены foundation-слой пакета, utility-стили кнопки
// и встроенные темы `light`/`dark`.
// import '@granularity-button-css'
// import './styles/light-app.css'

// Вариант 4: granular-подключение через `presetGranularityNode`.
// Foundation-слой пакета, utility-стили выбранных компонентов, встроенные темы `light`/`dark`
// и app theme собираются через `apps/playground/uno.config.ts`.

// Keep UnoCSS only for the playground shell. Package button styles must come from built dist artifacts.
import '@unocss/reset/tailwind-compat.css'
import 'virtual:uno.css'

createApp(App).mount('#app')