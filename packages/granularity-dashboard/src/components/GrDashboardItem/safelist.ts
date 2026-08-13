import { splitClassTokens } from '../../internal/classTokens'
import { dashboardFrameSafelist } from '../GrDashboardFrame/frameSafelist'
import {
  actionsClass,
  bodyClass,
  bodySizes,
  draggingClass,
  headerClass,
  headerSizes,
  rootClass,
  titleClass,
} from './grDashboardItemStyles'

export const grDashboardItemSafelist = [...new Set([
  ...dashboardFrameSafelist,
  ...Object.values(headerSizes).flatMap(splitClassTokens),
  ...Object.values(bodySizes).flatMap(splitClassTokens),
  ...splitClassTokens(rootClass),
  ...splitClassTokens(draggingClass),
  ...splitClassTokens(headerClass),
  ...splitClassTokens(titleClass),
  ...splitClassTokens(bodyClass),
  ...splitClassTokens(actionsClass),
])]
