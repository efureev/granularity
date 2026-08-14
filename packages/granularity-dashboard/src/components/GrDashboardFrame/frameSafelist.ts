import { splitClassTokens } from '../../internal/classTokens'
import {
  animatedClass,
  dragHandleClass,
  emptyTextClass,
  emptyWrapClass,
  dragHandleGrabbedClass,
  gridClass,
  placeholderClass,
  resizeHandleClass,
  srOnlyClass,
} from './frameStyles'

/**
 * Классы общей рамы. Подмешивается в safelist **каждого** компонента пакета:
 * `frameStyles.ts` уезжает в общий чанк, и пресет его не сканирует.
 */
export const dashboardFrameSafelist = [...new Set([
  ...splitClassTokens(gridClass),
  ...splitClassTokens(placeholderClass),
  ...splitClassTokens(dragHandleClass),
  ...splitClassTokens(dragHandleGrabbedClass),
  ...splitClassTokens(resizeHandleClass),
  ...splitClassTokens(animatedClass),
  ...splitClassTokens(emptyWrapClass),
  ...splitClassTokens(emptyTextClass),
  ...splitClassTokens(srOnlyClass),
])]
