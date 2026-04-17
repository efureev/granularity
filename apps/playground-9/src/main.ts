import { createApp } from 'vue'
import App from './App.vue'

// Стили грузим параллельно — порядок гарантируется самим `Promise.all`:
//   reset        — сбрасывает базовые стили браузера,
//   granularity  — токены тем + CSS примитивов `DsFormField/DsInput/DsButton`
//                  (через `presetGranularityNode`) + styles.css композита
//                  `XgQuickForm` из `@feugene/extra-granularity`,
//   app-styles   — utility-классы UnoCSS, используемые в шаблонах приложения.
//
// Никаких `@feugene/granularity/components/<Name>/styles.css` руками —
// foundation и компонентные preflights приходят из preset'а.
await Promise.all([
  import('./reset'),
  import('./granularity'),
  import('./app-styles'),
])

// Композитный компонент `<XgQuickForm />` импортируется явно в `App.vue`
// (резолвер `@feugene/unplugin-granularity` по умолчанию резолвит только
// `Ds*`, а `Xg*` приходит из отдельного пакета). Примитивы granularity сам
// композит импортирует через sub-path — никаких корневых импортов.
createApp(App).mount('#app')
