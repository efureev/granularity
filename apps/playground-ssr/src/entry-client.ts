import { createApp } from './app'
import { resolvePage } from './pages'

import './styles'

// `createSSRApp().mount()` не перерисовывает разметку, а гидрирует уже пришедшую
// с сервера. Любое расхождение Vue напишет в консоль как hydration mismatch.
// Страница берётся тем же резолвером, что и на сервере, — иначе гидрация
// сверяла бы разное.
createApp(resolvePage(window.location.pathname)).mount('#app')
