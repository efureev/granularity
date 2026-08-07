import { splitClassTokens } from '../shared/classTokens'
import {
  countBaseClass,
  dotBaseClass,
  dotPlacementClass,
  placementClass,
  rootClass,
  toneClass,
} from './grBadgeWrapStyles'

export const grBadgeWrapSafelist = [...new Set([
  ...splitClassTokens(rootClass),
  ...splitClassTokens(dotBaseClass),
  ...splitClassTokens(countBaseClass),
  ...Object.values(placementClass).flatMap(splitClassTokens),
  ...Object.values(dotPlacementClass).flatMap(splitClassTokens),
  ...Object.values(toneClass).flatMap(splitClassTokens),
])]
