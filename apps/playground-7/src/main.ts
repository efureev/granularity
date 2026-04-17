import { createApp } from 'vue'

// Сначала ресет, потом специальный foundation-слой (токены/переменные тем),
// потом — только CSS-файлы тех компонентов, которые мы реально используем.
// Никакого общего `styles.css` из корня пакета — мы экономим и JS, и CSS.
import '@unocss/reset/tailwind-compat.css'
import '@feugene/granularity/foundation.css'
import '@feugene/granularity/components/DsButton/styles.css'
import '@feugene/granularity/components/DsInput/styles.css'

// Фабрика из отдельного sub-path — сам файл плагина не тянет за собой ни
// компоненты, ни директивы, всё приходит ниже.
import { createGranularity } from '@feugene/granularity/vue'

// Гранулярные sub-path импорты — именно они определяют, что попадёт в бандл.
import { DsButton } from '@feugene/granularity/components/DsButton'
import { DsInput }  from '@feugene/granularity/components/DsInput'
import { vHotkey }  from '@feugene/granularity/directives/hotkey'

import App from './App.vue'
import './app.css'

// Компоненты передаём как есть — фабрика сама возьмёт имя регистрации из
// `__name` (Vue 3 подставляет его в SFC из имени файла) или из `name`.
// При необходимости имя можно задать явно: `{ name: 'MyButton', component: DsButton }`.
const Granularity = createGranularity({
  components: [DsButton, DsInput],
  directives: [
    { name: 'hotkey', directive: vHotkey },
  ],
})

createApp(App)
  .use(Granularity)
  .mount('#app')
