import { defineGranumConfig } from '@feugene/granum/vite'
import { windEngine } from '@feugene/granum-engine-wind'

import { buildThemes } from './src/app/themes'

const THEME = 'slate'

/**
 * Скан утилит — по коду приложения (`src/app`): тесты и точка входа классов не
 * несут.
 *
 * Остальные темы каталога — дополнительные, каждая своим листом: раздел
 * «Темы» показывает каждую на настоящих компонентах, островами
 * `<GrConfigProvider theme="…">`, которые сами подгружают лист своей темы.
 *
 * Обрезка выключена: страницы основ и вкладка «Токены» показывают каждый токен
 * темы по имени из её данных (`var(${token.name})`). Такое потребление granum
 * не видит и снял бы эти токены как недостижимые.
 */
export default defineGranumConfig({
  engine: windEngine(),
  providers: ['@feugene/granularity'],
  components: 'all',
  themes: buildThemes(THEME),
  appSources: { dirs: ['src/app'] },
  pruneTokens: { mode: 'off' },
})
