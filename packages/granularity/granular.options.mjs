/**
 * Опции для `granular doctor` — CLI не умеет читать `uno.config.ts` приложения,
 * поэтому провайдер отдаётся ему отдельным модулем.
 *
 * `components: 'all'` обязательно: источниками проверки служат только выбранные
 * компоненты, и с любой другой селекцией доктор проверит лишь её замыкание.
 * Провайдер берётся из `dist` — проверяется то, что отгружается, а не исходники.
 */
// Импорт из `dist` здесь не оплошность, а суть проверки: доктор сверяет граф
// с тем, что отгружается. От исходников то же самое делает юнит-гейт.
// eslint-disable-next-line antfu/no-import-dist
import { granularityProvider } from './dist/granular-provider.js'

export default {
  providers: [granularityProvider],
  components: 'all',
}
