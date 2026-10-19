import { defineGranumConfig } from '@feugene/granum/vite'
import { windEngine } from '@feugene/granum-engine-wind'

import { previewThemeIds } from './src/app/themes'

const THEME = 'slate'

/**
 * Скан утилит — только по оболочке приложения (`src/app`). Макеты в
 * `src/designs` живут в shadow DOM со своими стилями: утилиты документа туда не
 * доходят, а их имена классов (`block`, `body`, `sq`) движок принял бы за свои
 * и раздул CSS оболочки.
 *
 * Остальные темы каталога — превью: раздел «Темы» показывает каждую на
 * настоящих компонентах, островами `<GrConfigProvider theme="…">`.
 */
export default defineGranumConfig({
  engine: windEngine(),
  providers: ['@feugene/granularity'],
  components: 'all',
  theme: THEME,
  previews: previewThemeIds(THEME),
  modes: { names: ['light', 'dark'] },
  appSources: { dirs: ['src/app'] },
})
