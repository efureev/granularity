import { splitClassTokens } from '../shared/classTokens'
import { grProgressBarFillClass, type GrProgressBarTone, trackSizes } from './grStyle'

const TONES: GrProgressBarTone[] = ['primary', 'neutral', 'success', 'warning', 'danger', 'info', 'slate', 'azure']

const fillTokens = TONES.flatMap(tone => splitClassTokens(grProgressBarFillClass(tone)))

export const grProgressBarClassTokens = {
  fill: fillTokens,
  track: Object.values(trackSizes).flatMap(splitClassTokens),
} as const

export const grProgressBarSafelist = [...new Set([
  ...grProgressBarClassTokens.fill,
  ...grProgressBarClassTokens.track,
])] as const
