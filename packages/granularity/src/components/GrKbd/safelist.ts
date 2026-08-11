import { splitClassTokens } from '../shared/classTokens'
import {
  comboBaseClass,
  comboGaps,
  keyBaseClass,
  keySizes,
  mergedGaps,
  mergedKeyClass,
  separatorClass,
  sequenceSeparatorClass,
} from './grKbdStyles'

export const grKbdSafelist = [...new Set([
  ...splitClassTokens(keyBaseClass),
  ...Object.values(keySizes).flatMap(splitClassTokens),
  ...splitClassTokens(comboBaseClass),
  ...Object.values(comboGaps).flatMap(splitClassTokens),
  ...Object.values(mergedGaps).flatMap(splitClassTokens),
  ...splitClassTokens(mergedKeyClass),
  ...splitClassTokens(separatorClass),
  ...splitClassTokens(sequenceSeparatorClass),
])]
