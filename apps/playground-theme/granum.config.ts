import { defineGranumConfig } from '@feugene/granum/vite'
import { windEngine } from '@feugene/granum-engine-wind'
import { loadTheme } from '@feugene/granularity-tokens/theme/node'

import { contrast, ocean } from './theme.config'

/**
 * Три способа своей палитры в одной сборке.
 *
 * - `ocean` и `contrast` — режимы основной темы `slate` (`modes.define` её
 *   записи): встают под свои пары `slate-ocean`/`slate-contrast` и берут токены
 *   компонентов у режима `extends`. Собраны `extendMode`/`createMode` в `theme.config.mjs`.
 * - `clay` и `brand` — дополнительные темы: тема каталога «Глина» и своя тема
 *   приложения из папки `src/themes/brand/` (`extends: slate`, только отличия).
 *   Каждая — своим листом: полные блоки своих пар, которые включает
 *   `<GrConfigProvider theme="…">` на острове или `setTheme` на корне. Правка
 *   файлов `brand` в dev перезапускает конфиг — их перечисляет `sources`.
 *
 * `components: 'all'` намеренно: стенд рисует полный каталог ролей, и селекция
 * по списку здесь только маскировала бы пропуски темы.
 */
export default defineGranumConfig({
  engine: windEngine(),
  providers: ['@feugene/granularity', '@feugene/granularity-chrono', '@feugene/granularity-charts'],
  components: 'all',
  themes: [
    {
      theme: 'slate',
      default: true,
      modes: {
        names: ['light', 'dark', 'ocean', 'contrast'],
        define: {
          ocean: { ...ocean.definition, fallbacks: ocean.fallbacks },
          contrast: { ...contrast.definition, fallbacks: contrast.fallbacks },
        },
      },
    },
    { theme: 'clay', modes: ['light', 'dark'] },
    { theme: loadTheme(new URL('./src/themes/brand/', import.meta.url)), modes: ['light', 'dark'] },
  ],
  appSources: { dirs: ['src'] },
})
