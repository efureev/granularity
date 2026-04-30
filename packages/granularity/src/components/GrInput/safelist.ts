import { splitClassTokens } from '../shared/classTokens'
import { sizes, states, textAlign } from './grInputStyles'

export const grInputSafelist = [...new Set([
  ...Object.values(sizes).flatMap(splitClassTokens),
  ...Object.values(textAlign).flatMap(splitClassTokens),
  ...Object.values(states).flatMap(splitClassTokens),
])]
