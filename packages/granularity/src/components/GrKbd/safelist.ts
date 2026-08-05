import { splitClassTokens } from '../shared/classTokens'
import { comboBaseClass, comboGaps, keyBaseClass, keySizes, separatorClass } from './grKbdStyles'

export const grKbdSafelist = [...new Set([
  ...splitClassTokens(keyBaseClass),
  ...Object.values(keySizes).flatMap(splitClassTokens),
  ...splitClassTokens(comboBaseClass),
  ...Object.values(comboGaps).flatMap(splitClassTokens),
  ...splitClassTokens(separatorClass),
])]
