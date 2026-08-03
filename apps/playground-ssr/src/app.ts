import { createSSRApp, type Component } from 'vue'

import { granularityToastPlugin } from '@feugene/granularity'

import App from './App.vue'

/**
 * Фабрика приложения. В SSR приложение создаётся ЗАНОВО на каждый запрос —
 * общий инстанс протёк бы состоянием одного пользователя в ответ другому.
 *
 * `root` подменяется только тестами: им нужна ещё и страница-улика
 * (`ProblemPage.vue`) с компонентами без обёртки `ClientOnly`.
 */
export function createApp(root: Component = App) {
  const app = createSSRApp(root)

  // Обязательно для SSR: `useToast` намеренно запрещает модульный синглтон на
  // сервере — одно mutable-состояние на модуль текло бы между запросами.
  // Без плагина `GrToaster` роняет рендер с внятной ошибкой.
  app.use(granularityToastPlugin)

  return app
}
