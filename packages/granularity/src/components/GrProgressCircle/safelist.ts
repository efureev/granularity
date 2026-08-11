import { splitClassTokens } from '../shared/classTokens'
import {
  centerClass,
  rootClass,
  statusIconSizeBySize,
  svgClass,
  valueClass,
} from './grProgressCircleStyles'

export const grProgressCircleSafelist = [...new Set([
  ...Object.values(statusIconSizeBySize).flatMap(splitClassTokens),
  ...splitClassTokens(rootClass),
  ...splitClassTokens(svgClass),
  ...splitClassTokens(centerClass),
  ...splitClassTokens(valueClass),
])]
