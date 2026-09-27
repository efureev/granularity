import { defineGranumConfig } from '@feugene/granum/vite'
import { miniEngine } from '@feugene/granum-engine-mini'

/**
 * Конфиг приложения для granum.
 *
 * Темы приложения (`ocean`, `contrast`) подключаются НЕ здесь, а обычным
 * импортом CSS в `src/main.ts`. Поле `themes.names` задаёт, какие темы ПАКЕТА
 * уезжают в сборку; третья тема — это CSS самого приложения, и granum о ней
 * знать не обязан: она лежит в своём слое и перекрывает пакетные значения по
 * селектору `[data-theme='ocean']`.
 *
 * `components: 'all'` намеренно: стенд рисует полный каталог ролей, и селекция
 * по списку здесь только маскировала бы пропуски темы.
 */
export default defineGranumConfig({
  engine: miniEngine(),
  providers: ['@feugene/granularity'],
  components: 'all',
  themes: { names: ['light', 'dark'] },
  appSources: { dirs: ['src'] },
})
