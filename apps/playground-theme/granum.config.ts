import { defineGranumConfig } from '@feugene/granum/vite'
import { windEngine } from '@feugene/granum-engine-wind'
import { loadTheme } from '@feugene/granularity-tokens/theme/node'

import { contrast, ocean } from './theme.config'

/**
 * Три способа своей палитры в одной сборке.
 *
 * - `ocean` и `contrast` — режимы темы `slate` (`modes.define`): встают под
 *   свои пары `slate-ocean`/`slate-contrast` и берут токены компонентов у
 *   режима `extends`. Собраны `extendMode`/`createMode` в `theme.config.mjs`.
 * - `brand` — своя тема приложения из папки `src/themes/brand/` (`extends:
 *   slate`, только отличия). Активная тема одна, поэтому `brand` едет превью:
 *   полными блоками пар `brand-light`/`brand-dark`, которые включает
 *   `<GrConfigProvider theme="brand">`. Правка её файлов в dev перезапускает
 *   конфиг — их перечисляет `sources`.
 *
 * `components: 'all'` намеренно: стенд рисует полный каталог ролей, и селекция
 * по списку здесь только маскировала бы пропуски темы.
 */
export default defineGranumConfig({
  engine: windEngine(),
  providers: ['@feugene/granularity'],
  components: 'all',
  theme: 'slate',
  previews: [loadTheme(new URL('./src/themes/brand/', import.meta.url))],
  modes: {
    names: ['light', 'dark', 'ocean', 'contrast'],
    define: { ocean: ocean.definition, contrast: contrast.definition },
  },
  appSources: { dirs: ['src'] },
})
