import { splitClassTokens } from '../shared/classTokens'
import {
  badgeIconClass,
  badgeIconSizeClassBySize,
  darkToneClassByTone,
  lightToneClassByTone,
  semiRadiusClassBySize,
  sizeClassBySize,
} from './grBadgeStyles'

export const grBadgeSafelist = [...new Set([
  ...Object.values(sizeClassBySize).flatMap(splitClassTokens),
  ...Object.values(badgeIconSizeClassBySize).flatMap(splitClassTokens),
  ...splitClassTokens(badgeIconClass),
  ...Object.values(semiRadiusClassBySize).flatMap(splitClassTokens),
  'rounded-[var(--gr-radius-none)]',
  'rounded-[var(--gr-radius-full)]',
  ...Object.values(lightToneClassByTone).flatMap(splitClassTokens),
  ...Object.values(darkToneClassByTone).flatMap(splitClassTokens),
])]
