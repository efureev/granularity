import { splitClassTokens } from '../shared/classTokens'
import {
  labelBase,
  labelDisabledClass,
  labelSizes,
  rootBase,
  rootLabelPositions,
  stateTextAutoPaddings,
  stateTextBase,
  stateTextColors,
  stateTextGhostClass,
  stateTextLayouts,
  stateTextPaddings,
  stateTextSizes,
  stateTextStackClass,
  thumbBase,
  thumbSizes,
  thumbContentSizes,
  thumbIconBase,
  thumbSpinnerBase,
  thumbPositions,
  trackAutoSizes,
  trackBase,
  trackSizes,
} from './grSwitchStyles'

export const grSwitchClassTokens = {
  rootBase: splitClassTokens(rootBase),
  rootLabelPositions: Object.values(rootLabelPositions).flatMap(splitClassTokens),
  trackBase: splitClassTokens(trackBase),
  trackSizes: [
    ...Object.values(trackSizes).flatMap(splitClassTokens),
    ...Object.values(trackAutoSizes).flatMap(splitClassTokens),
  ],
  thumbBase: splitClassTokens(thumbBase),
  thumbSizes: Object.values(thumbSizes).flatMap(splitClassTokens),
  thumbContent: [
    ...splitClassTokens(thumbSpinnerBase),
    ...splitClassTokens(thumbIconBase),
    ...Object.values(thumbContentSizes).flatMap(splitClassTokens),
  ],
  thumbPositions: Object.values(thumbPositions).flatMap(splitClassTokens),
  labelBase: [...splitClassTokens(labelBase), ...splitClassTokens(labelDisabledClass)],
  labelSizes: Object.values(labelSizes).flatMap(splitClassTokens),
  stateText: [
    ...splitClassTokens(stateTextBase),
    ...splitClassTokens(stateTextStackClass),
    ...splitClassTokens(stateTextGhostClass),
    ...Object.values(stateTextLayouts).flatMap(splitClassTokens),
    ...Object.values(stateTextSizes).flatMap(splitClassTokens),
    ...Object.values(stateTextColors).flatMap(splitClassTokens),
    ...[stateTextPaddings, stateTextAutoPaddings].flatMap(map => (
      Object.values(map).flatMap(({ checked, unchecked }) => [
        ...splitClassTokens(checked),
        ...splitClassTokens(unchecked),
      ])
    )),
  ],
} as const

export const grSwitchSafelist = [...new Set([
  ...grSwitchClassTokens.rootBase,
  ...grSwitchClassTokens.rootLabelPositions,
  ...grSwitchClassTokens.trackBase,
  ...grSwitchClassTokens.trackSizes,
  ...grSwitchClassTokens.thumbBase,
  ...grSwitchClassTokens.thumbSizes,
  ...grSwitchClassTokens.thumbContent,
  ...grSwitchClassTokens.thumbPositions,
  ...grSwitchClassTokens.labelBase,
  ...grSwitchClassTokens.labelSizes,
  ...grSwitchClassTokens.stateText,
])]
