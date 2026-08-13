import { splitClassTokens } from '../../internal/classTokens'
import { dashboardFrameSafelist } from '../GrDashboardFrame/frameSafelist'

export const grDashboardSafelist = [...new Set([
  ...dashboardFrameSafelist,
  ...splitClassTokens(''),
])]
