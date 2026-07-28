import { createApp } from './app'

import './styles'

// `createSSRApp().mount()` не перерисовывает разметку, а гидрирует уже пришедшую
// с сервера. Любое расхождение Vue напишет в консоль как hydration mismatch.
createApp().mount('#app')
