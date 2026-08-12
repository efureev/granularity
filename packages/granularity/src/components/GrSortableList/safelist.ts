import { splitClassTokens } from '../shared/classTokens'
import {
  contentClass,
  dividedClass,
  emptyClass,
  handleClass,
  handleDisabledClass,
  handleIconClass,
  indicatorAfterClass,
  indicatorBeforeClass,
  listClass,
  rowDisabledClass,
  rowDraggingClass,
  rowFocusClass,
  rowGrabbedClass,
  rowLayoutClass,
} from './grSortableListStyles'

export const grSortableListSafelist = [...new Set([
  ...Object.values(listClass).flatMap(splitClassTokens),
  ...splitClassTokens(rowLayoutClass),
  ...splitClassTokens(rowFocusClass),
  ...splitClassTokens(rowDraggingClass),
  ...splitClassTokens(rowGrabbedClass),
  ...splitClassTokens(rowDisabledClass),
  ...splitClassTokens(dividedClass),
  ...splitClassTokens(emptyClass),
  ...splitClassTokens(handleClass),
  ...splitClassTokens(handleDisabledClass),
  ...splitClassTokens(handleIconClass),
  ...splitClassTokens(contentClass),
  ...splitClassTokens(indicatorBeforeClass),
  ...splitClassTokens(indicatorAfterClass),
])]
