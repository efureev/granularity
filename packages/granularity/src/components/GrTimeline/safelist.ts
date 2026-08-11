import { splitClassTokens } from '../shared/classTokens'
import {
  densityPadding,
  descriptionClass,
  emptyClass,
  groupTitleClass,
  loadingRowClass,
  markerBaseClass,
  markerFilledToneClass,
  markerOutlinedToneClass,
  timeClass,
  titleClass,
} from './grTimelineStyles'

export const grTimelineSafelist = [...new Set([
  ...Object.values(densityPadding).flatMap(splitClassTokens),
  ...Object.values(markerFilledToneClass).flatMap(splitClassTokens),
  ...Object.values(markerOutlinedToneClass).flatMap(splitClassTokens),
  ...splitClassTokens(markerBaseClass),
  ...splitClassTokens(timeClass),
  ...splitClassTokens(titleClass),
  ...splitClassTokens(descriptionClass),
  ...splitClassTokens(groupTitleClass),
  ...splitClassTokens(emptyClass),
  ...splitClassTokens(loadingRowClass),
])]
