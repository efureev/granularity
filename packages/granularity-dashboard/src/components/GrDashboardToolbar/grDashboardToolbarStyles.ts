// Только тип: `import type` стирается на сборке и ребра графа компонентов не создаёт.
import type { GrComponentSize } from '@feugene/granularity/components/GrConfigProvider'

export type GrDashboardToolbarSize = GrComponentSize

export const toolbarClass = 'flex items-center gap-2 flex-wrap'

/**
 * Группы переносятся внутри себя: «Reset layout», «Edit layout» и `#end` на
 * 390px занимали 301px при 274px доступных, и панель вылезала за край. Ряд
 * панели уже переносится, но группа — один элемент ряда и шире строки сама
 * не становилась уже.
 */
export const groupClass = 'flex flex-wrap items-center gap-2 min-w-0'

export const spacerClass = 'flex-1 min-w-0'
