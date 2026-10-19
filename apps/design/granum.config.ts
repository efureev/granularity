import { defineGranumConfig } from '@feugene/granum/vite'
import { windEngine } from '@feugene/granum-engine-wind'

/**
 * Скан утилит — только по оболочке приложения (`src/app`). Макеты в
 * `src/designs` живут в shadow DOM со своими стилями: утилиты документа туда не
 * доходят, а их имена классов (`block`, `body`, `sq`) движок принял бы за свои
 * и раздул CSS оболочки.
 */
export default defineGranumConfig({
  engine: windEngine(),
  providers: ['@feugene/granularity'],
  components: 'all',
  theme: 'slate',
  modes: { names: ['light', 'dark'] },
  appSources: { dirs: ['src/app'] },
})
