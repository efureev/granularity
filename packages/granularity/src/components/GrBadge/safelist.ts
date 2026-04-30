import { splitClassTokens } from '../shared/classTokens'
import {
  darkToneClassByTone,
  lightToneClassByTone,
  semiRadiusClassBySize,
  sizeClassBySize,
} from './grBadgeStyles'

export const grBadgeSafelist = [...new Set([
  ...Object.values(sizeClassBySize).flatMap(splitClassTokens),
  ...Object.values(semiRadiusClassBySize).flatMap(splitClassTokens),
  'rounded-[var(--ds-radius-none)]',
  'rounded-full',
  ...Object.values(lightToneClassByTone).flatMap(splitClassTokens),
  ...Object.values(darkToneClassByTone).flatMap(splitClassTokens),
])]
