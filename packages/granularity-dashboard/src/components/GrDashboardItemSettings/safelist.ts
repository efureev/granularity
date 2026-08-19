import { splitClassTokens } from '../../internal/classTokens'
import { dashboardFrameSafelist } from '../GrDashboardFrame/frameSafelist'
import { bodyClass, footerClass, refusalClass, sizeRowClass } from './grDashboardItemSettingsStyles'

export const grDashboardItemSettingsSafelist = [...new Set([
  ...dashboardFrameSafelist,
  ...splitClassTokens(bodyClass),
  ...splitClassTokens(sizeRowClass),
  ...splitClassTokens(refusalClass),
  ...splitClassTokens(footerClass),
])]
