// Только тип: `import type` стирается на сборке и ребра графа компонентов не создаёт.
import type { GrComponentSize } from '@feugene/granularity/components/GrConfigProvider'

export type GrDashboardToolbarSize = GrComponentSize

export const toolbarClass = 'flex items-center gap-2 flex-wrap'

export const groupClass = 'flex items-center gap-2 min-w-0'

export const spacerClass = 'flex-1 min-w-0'
