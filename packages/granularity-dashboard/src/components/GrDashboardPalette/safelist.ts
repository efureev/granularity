import { splitClassTokens } from '../../internal/classTokens'
import { dashboardFrameSafelist } from '../GrDashboardFrame/frameSafelist'
import {
  descriptionClass,
  emptyClass,
  listClass,
  paletteSizes,
  rowClass,
  textClass,
  titleClass,
} from './grDashboardPaletteStyles'

export const grDashboardPaletteSafelist = [...new Set([
  ...dashboardFrameSafelist,
  ...Object.values(paletteSizes).flatMap(splitClassTokens),
  ...splitClassTokens(listClass),
  ...splitClassTokens(rowClass),
  ...splitClassTokens(textClass),
  ...splitClassTokens(titleClass),
  ...splitClassTokens(descriptionClass),
  ...splitClassTokens(emptyClass),
])]
