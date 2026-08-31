/**
 * Опции для `granular doctor` — CLI не умеет читать `uno.config.ts` приложения,
 * поэтому провайдер отдаётся ему отдельным модулем.
 *
 * Провайдер берётся из `dist`: проверяется то, что отгружается, а не исходники.
 * Селекция ограничена своими компонентами — компоненты ядра проверяет его
 * собственный `doctor`.
 */
// Импорт из `dist` здесь не оплошность, а суть проверки: доктор сверяет граф
// того, что отгружается, а не исходников.
// eslint-disable-next-line antfu/no-import-dist
import granularityCodeProvider from './dist/granular-provider.js'

export default {
  providers: [granularityCodeProvider],
  components: [{ provider: '@feugene/granularity-code', names: 'all' }],
}
