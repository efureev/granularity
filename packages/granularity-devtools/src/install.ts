import type { App, Plugin } from 'vue'
import { setupDevtoolsPlugin } from '@vue/devtools-api'

import { installGrDevtoolsBridge } from './internal/bridge'
import { interceptConsole } from './internal/consoleIntercept'
import { registerComponentConfig } from './plugin/componentConfig'
import { registerAnnouncer } from './plugin/announcer'
import { registerComponentTokens } from './plugin/componentTokens'
import { registerComponentVirtualList } from './plugin/componentVirtualList'
import { registerI18nState } from './plugin/i18nState'
import { registerIssues } from './plugin/issues'
import { registerOverlays } from './plugin/overlays'
import { registerToasts } from './plugin/toasts'
import { createGrIssueLog } from './resolve/issues'

const PLUGIN_ID = 'org.feugene.granularity'

/**
 * Выключаемся только при **явном** признаке production.
 *
 * Соблазн написать «включаться, если точно dev» (`typeof process !== 'undefined'
 * && NODE_ENV !== 'production'`) — ловушка: в dev-сервере Vite `process` в
 * браузере не определён вовсе, и панель не завелась бы ровно там, где нужна.
 * Замерено на `apps/playground`: `typeof process === 'undefined'`.
 *
 * Обратная сторона — в production-сборке Vite это выражение тоже сворачивается
 * в «не production», потому что `typeof process` там по-прежнему `false`.
 * Поэтому нулевой вес в проде обеспечивает не эта проверка, а гард у
 * вызывающего (`import.meta.env.DEV`, см. README): он убирает сам вызов, а
 * вместе с ним и импорт `@vue/devtools-api`. Здесь — страховка для сборщиков,
 * которые определяют `process` (webpack, rspack).
 */
function isProduction(): boolean {
  return typeof process !== 'undefined' && process.env.NODE_ENV === 'production'
}

/**
 * Vue-плагин, подключающий раздел «Granularity» в Vue DevTools.
 *
 * ```ts
 * const app = createApp(App)
 *
 * if (import.meta.env.DEV) {
 *   app.use(installGranularityDevtools())
 * }
 *
 * app.mount('#app')
 * ```
 *
 * Подключается явным вызовом, а не через `createGranularity`: плагин ядра
 * принципиально ничего не импортирует сам, и панель это правило не нарушает.
 * Гард у вызывающего — не перестраховка, а единственный способ убрать вызов из
 * прод-бандла целиком: см. `isProduction` выше.
 */
export function installGranularityDevtools(): Plugin {
  return {
    install(app: App) {
      // Панели нет ни на сервере, ни в проде: она рисуется расширением браузера.
      if (typeof window === 'undefined' || isProduction())
        return

      // Журнал, перехват консоли и мост живут независимо от панели: тест её не
      // открывает, а состояние ему нужно то же самое.
      const issues = createGrIssueLog()
      interceptConsole(issues)
      installGrDevtoolsBridge(issues)

      setupDevtoolsPlugin(
        {
          id: PLUGIN_ID,
          label: 'Granularity',
          packageName: '@feugene/granularity-devtools',
          homepage: 'https://efureev.github.io/granularity',
          // Без раннего прокси `setup` не выполнится, пока пользователь не
          // откроет вкладку DevTools, — а слои и объявления живого региона
          // случаются раньше, и панель показала бы пустую картину.
          enableEarlyProxy: true,
          app,
        },
        (api) => {
          registerOverlays(api)
          registerComponentConfig(api, issues)
          registerComponentTokens(api)
          registerComponentVirtualList(api)
          registerAnnouncer(api)
          registerIssues(api, issues)
          registerToasts(api, app)
          registerI18nState(api, app, issues)
        },
      )
    },
  }
}
