import { createSSRApp, type Component } from 'vue'

import App from './App.vue'

/**
 * Фабрика приложения. В SSR приложение создаётся ЗАНОВО на каждый запрос —
 * общий инстанс протёк бы состоянием одного пользователя в ответ другому.
 *
 * `root` подменяется только тестами: им нужна ещё и страница-улика
 * (`ProblemPage.vue`) с компонентами без обёртки `ClientOnly`.
 */
export function createApp(root: Component = App) {
  return createSSRApp(root)
}
