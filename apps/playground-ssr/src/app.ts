import { createSSRApp, type Component } from 'vue'

import { createCookieStorage } from '@feugene/granum/runtime'
import { GR_THEME_STORAGE_KEY, type GrModeName, granularityThemePlugin, granularityToastPlugin } from '@feugene/granularity'
import themeManifest from 'virtual:granum/themes'

import App from './App.vue'

/**
 * Фабрика приложения. В SSR приложение создаётся ЗАНОВО на каждый запрос —
 * общий инстанс протёк бы состоянием одного пользователя в ответ другому.
 *
 * `root` подменяется только тестами: им нужна ещё и страница-улика
 * (`ProblemPage.vue`) с компонентами без обёртки `ClientOnly`.
 *
 * `mode` — режим запроса, его сервер берёт из cookie. На клиенте его нет:
 * контроллер узнаёт пару, которую сервер уже поставил на `<html>`.
 */
export function createApp(root: Component = App, options: { mode?: GrModeName } = {}) {
  const app = createSSRApp(root)

  // Обязательно для SSR: `useToast` намеренно запрещает модульный синглтон на
  // сервере — одно mutable-состояние на модуль текло бы между запросами.
  // Без плагина `GrToaster` роняет рендер с внятной ошибкой.
  app.use(granularityToastPlugin)

  // То же и для режима, но мягче: читать его на сервере можно и без плагина, а
  // вот `setMode` без него бросает — режим одного запроса уехал бы в ответ другому.
  // Выбор живёт в cookie, а не в `localStorage`: иначе сервер его не увидит.
  app.use(granularityThemePlugin, {
    manifest: themeManifest,
    storage: createCookieStorage({ name: GR_THEME_STORAGE_KEY }),
    initial: options.mode,
  })

  return app
}
