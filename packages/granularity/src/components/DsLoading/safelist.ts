import { splitClassTokens } from '../shared/classTokens'
import { rootBackgroundClass, rootModeClass } from './dsLoadingStyles'

export const dsLoadingSafelist = [...new Set([
  ...Object.values(rootModeClass).flatMap(splitClassTokens),
  ...splitClassTokens(rootBackgroundClass),
])]
