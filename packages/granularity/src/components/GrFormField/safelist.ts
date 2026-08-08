import { splitClassTokens } from '../shared/classTokens'

import {
  controlColumnClass,
  errorBaseClass,
  errorTexts,
  fieldGaps,
  hintBaseClass,
  hintTexts,
  labelBaseClass,
  labelInlineClass,
  labelTexts,
  requiredMarkClass,
  rootColumnClass,
  rootRowClass,
} from './grFormFieldStyles'

export const grFormFieldSafelist = [...new Set([
  ...Object.values(fieldGaps).flatMap(splitClassTokens),
  ...Object.values(labelTexts).flatMap(splitClassTokens),
  ...Object.values(hintTexts).flatMap(splitClassTokens),
  ...Object.values(errorTexts).flatMap(splitClassTokens),
  ...splitClassTokens(labelBaseClass),
  ...splitClassTokens(hintBaseClass),
  ...splitClassTokens(errorBaseClass),
  ...splitClassTokens(requiredMarkClass),
  ...splitClassTokens(rootColumnClass),
  ...splitClassTokens(rootRowClass),
  ...splitClassTokens(labelInlineClass),
  ...splitClassTokens(controlColumnClass),
])]
