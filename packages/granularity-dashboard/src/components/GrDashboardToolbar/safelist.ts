import { splitClassTokens } from '../../internal/classTokens'
import { dashboardFrameSafelist } from '../GrDashboardFrame/frameSafelist'
import { groupClass, spacerClass, toolbarClass } from './grDashboardToolbarStyles'

export const grDashboardToolbarSafelist = [...new Set([
  ...dashboardFrameSafelist,
  ...splitClassTokens(toolbarClass),
  ...splitClassTokens(groupClass),
  ...splitClassTokens(spacerClass),
])]
