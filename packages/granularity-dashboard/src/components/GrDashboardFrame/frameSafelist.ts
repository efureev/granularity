import { splitClassTokens } from '../../internal/classTokens'
import {
  animatedClass,
  dragHandleClass,
  emptyTextClass,
  emptyWrapClass,
  dragHandleGrabbedClass,
  ghostClass,
  ghostMeasureClass,
  ghostTitleClass,
  gridClass,
  placeholderClass,
  resizeHandleClass,
  settingsButtonClass,
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
  ...splitClassTokens(settingsButtonClass),
  ...splitClassTokens(ghostClass),
  ...splitClassTokens(ghostTitleClass),
  ...splitClassTokens(ghostMeasureClass),
  ...splitClassTokens(animatedClass),
  ...splitClassTokens(emptyWrapClass),
  ...splitClassTokens(emptyTextClass),
  ...splitClassTokens(srOnlyClass),
])]
