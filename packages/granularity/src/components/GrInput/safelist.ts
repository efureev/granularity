import { splitClassTokens } from '../shared/classTokens'
import { invalidClass, shellBaseClass, shellDisabledClass, shellEnabledClass, sizes, states, textAlign } from './grInputStyles'

export const grInputSafelist = [...new Set([
  ...Object.values(sizes).flatMap(splitClassTokens),
  ...Object.values(textAlign).flatMap(splitClassTokens),
  ...Object.values(states).flatMap(splitClassTokens),
  ...splitClassTokens(invalidClass),
  ...splitClassTokens(shellBaseClass),
  ...splitClassTokens(shellEnabledClass),
  ...splitClassTokens(shellDisabledClass),
])]
