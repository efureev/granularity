import { createApp } from 'vue'

import { installGranularityDevtools } from '@feugene/granularity-devtools'
import { initThemeEarly } from '@feugene/granularity'

import '@unocss/reset/tailwind-compat.css'
// Весь CSS granum одним модулем: пять каскадных слоёв — токены, база, темы, CSS
// компонентов селекции и утилиты, включая классы разметки витрины.
import 'virtual:granum.css'
// Тема витрины — нелейерный CSS: по правилам каскада она выигрывает у любого
// `@layer`, поэтому порядок относительно granum на результат не влияет.
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

  const app = createApp(App)
    .use(i18n)
    .use(router)

  // Гард у вызывающего, а не внутри пакета: он убирает из прод-бандла и сам
  // вызов, и импорт `@vue/devtools-api`.
  if (import.meta.env.DEV)
    app.use(installGranularityDevtools())

  app.mount('#app')
}

void bootstrap()
