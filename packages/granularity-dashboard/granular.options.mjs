/**
 * Опции для `granular doctor` — CLI не умеет читать `uno.config.ts` приложения,
 * поэтому провайдер отдаётся ему отдельным модулем.
 *
 * Читается **собранный** `dist`: доктор проверяет раскладку артефактов и
 * scan-глобы, то есть ровно то, чего в исходниках ещё нет. Запускать после
 * `yarn build`.
 */
// eslint-disable-next-line antfu/no-import-dist
import granularityDashboardProvider from './dist/granular-provider.js'

export default {
  providers: [granularityDashboardProvider],
  components: [{ provider: '@feugene/granularity-dashboard', names: 'all' }],
}
