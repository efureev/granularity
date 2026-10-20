import { defineGranumConfig } from '@feugene/granum/vite'
import { windEngine } from '@feugene/granum-engine-wind'

import { buildThemes } from './src/app/themes'

const THEME = 'slate'

/**
 * Скан утилит — только по оболочке приложения (`src/app`). Макеты в
 * `src/designs` живут в shadow DOM со своими стилями: утилиты документа туда не
 * доходят, а их имена классов (`block`, `body`, `sq`) движок принял бы за свои
 * и раздул CSS оболочки.
 *
 * Остальные темы каталога — дополнительные, каждая своим листом: раздел
 * «Темы» показывает каждую на настоящих компонентах, островами
 * `<GrConfigProvider theme="…">`, которые сами подгружают лист своей темы.
 */
export default defineGranumConfig({
  engine: windEngine(),
  providers: ['@feugene/granularity'],
  components: 'all',
  themes: buildThemes(THEME),
  appSources: { dirs: ['src/app'] },
})
