/**
 * Опции для `granular doctor` — CLI не умеет читать `uno.config.ts` приложения,
 * поэтому провайдер отдаётся ему отдельным модулем.
 *
 * Провайдер берётся из `dist`: проверяется то, что отгружается, а не исходники.
 * `@feugene/granularity` подтягивается сам — он объявлен зависимостью на уровне
 * провайдера, и ядро пресета разворачивает граф рекурсивно.
 */
// Импорт из `dist` здесь не оплошность, а суть проверки: доктор сверяет граф
// того, что отгружается, а не исходников.
// eslint-disable-next-line antfu/no-import-dist
import granularityMediaProvider from './dist/granular-provider.js'

export default {
  providers: [granularityMediaProvider],
  components: [{ provider: '@feugene/granularity-media', names: 'all' }],
}
