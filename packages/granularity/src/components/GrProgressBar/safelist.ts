import { splitClassTokens } from '../shared/classTokens'
import { GR_TONES } from '../shared/tones'
import { bufferClass, grProgressBarFillClass, rowGaps, trackSizes, valueTextSizes } from './grStyle'

const fillTokens = GR_TONES.flatMap(tone => splitClassTokens(grProgressBarFillClass(tone)))

export const grProgressBarClassTokens = {
  fill: fillTokens,
  track: Object.values(trackSizes).flatMap(splitClassTokens),
  gap: Object.values(rowGaps).flatMap(splitClassTokens),
  value: Object.values(valueTextSizes).flatMap(splitClassTokens),
  buffer: splitClassTokens(bufferClass),
} as const

export const grProgressBarSafelist = [...new Set([
  ...grProgressBarClassTokens.fill,
  ...grProgressBarClassTokens.track,
  ...grProgressBarClassTokens.gap,
  ...grProgressBarClassTokens.value,
  ...grProgressBarClassTokens.buffer,
])] as const
