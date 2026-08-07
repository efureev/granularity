import { splitClassTokens } from '../shared/classTokens'
import {
  actionsBaseClass,
  actionsBySize,
  descriptionBaseClass,
  descriptionBySize,
  iconBoxBaseClass,
  iconBoxBySize,
  rootBaseClass,
  rootPaddingBySize,
  titleBaseClass,
  titleBySize,
  variantClass,
} from './grEmptyStateStyles'

export const grEmptyStateSafelist = [...new Set([
  ...splitClassTokens(rootBaseClass),
  ...splitClassTokens(iconBoxBaseClass),
  ...splitClassTokens(titleBaseClass),
  ...splitClassTokens(descriptionBaseClass),
  ...splitClassTokens(actionsBaseClass),
  ...Object.values(variantClass).flatMap(splitClassTokens),
  ...Object.values(rootPaddingBySize).flatMap(splitClassTokens),
  ...Object.values(iconBoxBySize).flatMap(splitClassTokens),
  ...Object.values(titleBySize).flatMap(splitClassTokens),
  ...Object.values(descriptionBySize).flatMap(splitClassTokens),
  ...Object.values(actionsBySize).flatMap(splitClassTokens),
  // Центрирование блока иконки живёт литералом в шаблоне.
  ...splitClassTokens('flex justify-center'),
])]
