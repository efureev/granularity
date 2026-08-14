import { splitClassTokens } from '../../internal/classTokens'
import { dashboardFrameSafelist } from '../GrDashboardFrame/frameSafelist'
import {
  actionClass,
  descriptionClass,
  emptyClass,
  headingClass,
  listClass,
  measureClass,
  paletteSizes,
  rowClass,
  rowDisabledClass,
  textClass,
  titleClass,
} from './grDashboardPaletteStyles'

export const grDashboardPaletteSafelist = [...new Set([
  ...dashboardFrameSafelist,
  ...Object.values(paletteSizes).flatMap(splitClassTokens),
  ...splitClassTokens(listClass),
  ...splitClassTokens(rowClass),
  ...splitClassTokens(rowDisabledClass),
  ...splitClassTokens(headingClass),
  ...splitClassTokens(measureClass),
  ...splitClassTokens(actionClass),
  ...splitClassTokens(textClass),
  ...splitClassTokens(titleClass),
  ...splitClassTokens(descriptionClass),
  ...splitClassTokens(emptyClass),
])]
