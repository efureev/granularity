import { splitClassTokens } from '../shared/classTokens'
import { panelSizes, panelWidths } from './grTooltipStyles'

export const grTooltipSafelist = [...new Set([
  ...Object.values(panelSizes).flatMap(splitClassTokens),
  ...Object.values(panelWidths).flatMap(splitClassTokens),
])]
