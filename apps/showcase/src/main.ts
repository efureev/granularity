import {createApp} from 'vue'

import {initThemeEarly} from '@feugene/granularity'

import '@unocss/reset/tailwind-compat.css'
import 'virtual:uno.css'
import './styles/showcase-theme.css'

import App from './App.vue'
import {router} from './app/router'
import {setupShowcaseI18n} from './i18n'

initThemeEarly()

const i18n = await setupShowcaseI18n()

createApp(App)
    .use(i18n)
    .use(router)
    .mount('#app')