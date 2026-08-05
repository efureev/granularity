/**
 * Опции для `granular doctor` — CLI не умеет читать `uno.config.ts` приложения,
 * поэтому провайдер отдаётся ему отдельным модулем.
 *
 * Провайдер берётся из `dist`: проверяется то, что отгружается, а не исходники.
 * `@feugene/granularity` подтягивается сам — он объявлен зависимостью на уровне
 * провайдера, и ядро пресета разворачивает граф рекурсивно.
 *
 * Селекция ограничена своими компонентами намеренно. `'all'` выбрал бы и все
 * компоненты транзитивного донора: их проверяет собственный `doctor`
 * granularity, а здесь это лишь потребовало бы его свежего `dist` ради чужого
 * результата.
 */
import granularityDatepickerProvider from './dist/granular-provider.js'

export default {
  providers: [granularityDatepickerProvider],
  components: [{ provider: '@feugene/granularity-datepicker', names: 'all' }],
}
