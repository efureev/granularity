import { splitClassTokens } from '../shared/classTokens'
import { grProgressBarFillClass, type GrProgressBarTone } from './grStyle'

const TONES: GrProgressBarTone[] = ['primary', 'neutral', 'success', 'warning', 'danger', 'info', 'slate', 'azure']

const fillTokens = TONES.flatMap(tone => splitClassTokens(grProgressBarFillClass(tone)))

export const grProgressBarClassTokens = {
  fill: fillTokens,
} as const

export const grProgressBarSafelist = [...new Set([
  ...grProgressBarClassTokens.fill,
])] as const
