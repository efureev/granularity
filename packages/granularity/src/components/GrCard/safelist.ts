import { splitClassTokens } from '../shared/classTokens'
import {
  headerActionsClass,
  headerRowClass,
  cardDescriptionClass,
  cardTitleClass,
  hoverClass,
  interactiveClass,
  ownHeaderPaddingClass,
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
  ...splitClassTokens(ownHeaderPaddingClass),
  ...splitClassTokens(headerRowClass),
  ...splitClassTokens(headerActionsClass),
  ...splitClassTokens(sectionDividerTopClass),
  ...splitClassTokens(sectionDividerBottomClass),
  ...splitClassTokens(interactiveClass),
  ...splitClassTokens(hoverClass),
  ...splitClassTokens(cardTitleClass),
  ...splitClassTokens(cardDescriptionClass),
])]
