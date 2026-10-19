import { defineGranumConfig } from '@feugene/granum/vite'
import { windEngine } from '@feugene/granum-engine-wind'

/**
 * Конфиг приложения для granum.
 *
 * Темы приложения (`ocean`, `contrast`) подключаются НЕ здесь, а обычным
 * импортом CSS в `src/main.ts`. `theme` выбирает тему каталога пакета, `modes`
 * — её режимы, которые уезжают в сборку парами `slate-<режим>`; третья тема —
 * это CSS самого приложения, и granum о ней знать не обязан: она лежит в своём
 * слое и перекрывает пакетные значения по селектору `[data-theme='ocean']`.
 *
 * `components: 'all'` намеренно: стенд рисует полный каталог ролей, и селекция
 * по списку здесь только маскировала бы пропуски темы.
 */
export default defineGranumConfig({
  engine: windEngine(),
  providers: ['@feugene/granularity'],
  components: 'all',
  theme: 'slate',
  modes: { names: ['light', 'dark'] },
  appSources: { dirs: ['src'] },
})
