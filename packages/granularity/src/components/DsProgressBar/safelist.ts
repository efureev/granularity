import { splitClassTokens } from '../shared/classTokens'
import { dsProgressBarFillClass, type DsProgressBarTone } from './dsStyle'

const TONES: DsProgressBarTone[] = ['primary', 'neutral', 'success', 'warning', 'danger', 'info', 'slate', 'azure']

const fillTokens = TONES.flatMap(tone => splitClassTokens(dsProgressBarFillClass(tone)))

export const dsProgressBarClassTokens = {
  fill: fillTokens,
} as const

export const dsProgressBarSafelist = [...new Set([
  ...dsProgressBarClassTokens.fill,
])] as const
