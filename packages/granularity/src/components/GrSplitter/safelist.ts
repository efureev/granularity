import { splitClassTokens } from '../shared/classTokens'
import { paneClass, rootClass, separatorClass } from './grSplitterStyles'

export const grSplitterSafelist = [...new Set([
  ...splitClassTokens(rootClass),
  ...splitClassTokens(paneClass),
  ...splitClassTokens(separatorClass),
])]
