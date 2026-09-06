import { splitClassTokens } from '../shared/classTokens'
import {
  caretClass,
  cellActiveClass,
  cellBaseClass,
  cellDisabledClass,
  cellIdleClass,
  cellInvalidActiveClass,
  cellInvalidClass,
  cellSizes,
  fieldClass,
  placeholderClass,
  rootBaseClass,
  rootGaps,
  separatorClass,
} from './grOtpInputStyles'

export const grOtpInputClassTokens = {
  root: [...splitClassTokens(rootBaseClass), ...Object.values(rootGaps).flatMap(splitClassTokens)],
  field: splitClassTokens(fieldClass),
  cell: [
    ...splitClassTokens(cellBaseClass),
    ...Object.values(cellSizes).flatMap(splitClassTokens),
    ...splitClassTokens(cellIdleClass),
    ...splitClassTokens(cellActiveClass),
    ...splitClassTokens(cellInvalidClass),
    ...splitClassTokens(cellInvalidActiveClass),
    ...splitClassTokens(cellDisabledClass),
  ],
  decoration: [
    ...splitClassTokens(placeholderClass),
    ...splitClassTokens(caretClass),
    ...splitClassTokens(separatorClass),
  ],
} as const

export const grOtpInputSafelist = [...new Set([
  ...grOtpInputClassTokens.root,
  ...grOtpInputClassTokens.field,
  ...grOtpInputClassTokens.cell,
  ...grOtpInputClassTokens.decoration,
])]
