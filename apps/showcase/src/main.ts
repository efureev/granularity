import { createApp } from 'vue'

import { initThemeEarly } from '@feugene/granularity'

import '@unocss/reset/tailwind-compat.css'
import 'virtual:uno.css'
import './styles/showcase-theme.css'

import App from './App.vue'
import { router } from './app/router'
import { setupShowcaseI18n } from './i18n'

initThemeEarly()

/**
 * Точка входа асинхронна из-за локалей: словари грузятся динамически, и до
 * первого рендера приложение должно знать язык. Обёртка в функцию, а не
 * top-level await, — он превращает модуль в отложенный и меняет порядок
 * выполнения всего графа импортов.
 */
async function bootstrap(): Promise<void> {
  const i18n = await setupShowcaseI18n()

  createApp(App)
    .use(i18n)
    .use(router)
    .mount('#app')
}

void bootstrap()
