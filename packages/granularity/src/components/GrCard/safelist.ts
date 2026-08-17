import { splitClassTokens } from '../shared/classTokens'
import {
  cardDescriptionClass,
  cardTitleClass,
  hoverClass,
  interactiveClass,
  paddingClass,
  sectionDividerBottomClass,
  sectionDividerTopClass,
  surfaceBaseClass,
  variantClass,
} from './grCardStyles'

export const grCardSafelist = [...new Set([
  ...splitClassTokens(surfaceBaseClass),
  ...Object.values(variantClass).flatMap(splitClassTokens),
  ...Object.values(paddingClass).flatMap(splitClassTokens),
  ...splitClassTokens(sectionDividerTopClass),
  ...splitClassTokens(sectionDividerBottomClass),
  ...splitClassTokens(interactiveClass),
  ...splitClassTokens(hoverClass),
  ...splitClassTokens(cardTitleClass),
  ...splitClassTokens(cardDescriptionClass),
])]
