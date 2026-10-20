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
 * - `clay` и `brand` — превью: тема каталога «Глина» и своя тема приложения из
 *   папки `src/themes/brand/` (`extends: slate`, только отличия). Активная тема
 *   одна, поэтому превью едут полными блоками своих пар, которые включает
 *   `<GrConfigProvider theme="…">`. Правка файлов `brand` в dev перезапускает
 *   конфиг — их перечисляет `sources`.
 * - `css.previews: 'separate'` — блоки превью не в общем листе, а в
 *   `virtual:granum/previews.css`: его подключает страница, которая превью
 *   показывает (здесь она одна — `src/granularity.ts`).
 *
 * `components: 'all'` намеренно: стенд рисует полный каталог ролей, и селекция
 * по списку здесь только маскировала бы пропуски темы.
 */
export default defineGranumConfig({
  engine: windEngine(),
  providers: ['@feugene/granularity'],
  components: 'all',
  theme: 'slate',
  previews: ['clay', loadTheme(new URL('./src/themes/brand/', import.meta.url))],
  css: { previews: 'separate' },
  modes: {
    names: ['light', 'dark', 'ocean', 'contrast'],
    define: {
      ocean: { ...ocean.definition, fallbacks: ocean.fallbacks },
      contrast: { ...contrast.definition, fallbacks: contrast.fallbacks },
    },
  },
  appSources: { dirs: ['src'] },
})
