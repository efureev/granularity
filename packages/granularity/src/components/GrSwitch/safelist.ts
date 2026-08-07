import { splitClassTokens } from '../shared/classTokens'
import {
    labelBase,
    labelDisabledClass,
    labelSizes,
    rootBase,
    rootLabelPositions,
    thumbBase,
    thumbSizes,
    thumbSpinnerBase,
    thumbSpinnerSizes,
    thumbTranslations,
    trackBase,
    trackSizes,
} from './grSwitchStyles'

export const grSwitchClassTokens = {
    rootBase: splitClassTokens(rootBase),
    rootLabelPositions: Object.values(rootLabelPositions).flatMap(splitClassTokens),
    trackBase: splitClassTokens(trackBase),
    trackSizes: Object.values(trackSizes).flatMap(splitClassTokens),
    thumbBase: splitClassTokens(thumbBase),
    thumbSizes: Object.values(thumbSizes).flatMap(splitClassTokens),
    thumbSpinner: [
        ...splitClassTokens(thumbSpinnerBase),
        ...Object.values(thumbSpinnerSizes).flatMap(splitClassTokens),
    ],
    thumbTranslations: Object.values(thumbTranslations).flatMap(({checked, unchecked}) => {
        return [...splitClassTokens(checked), ...splitClassTokens(unchecked)]
    }),
    labelBase: [...splitClassTokens(labelBase), ...splitClassTokens(labelDisabledClass)],
    labelSizes: Object.values(labelSizes).flatMap(splitClassTokens),
} as const

export const grSwitchSafelist = [...new Set([
    ...grSwitchClassTokens.rootBase,
    ...grSwitchClassTokens.rootLabelPositions,
    ...grSwitchClassTokens.trackBase,
    ...grSwitchClassTokens.trackSizes,
    ...grSwitchClassTokens.thumbBase,
    ...grSwitchClassTokens.thumbSizes,
    ...grSwitchClassTokens.thumbSpinner,
    ...grSwitchClassTokens.thumbTranslations,
    ...grSwitchClassTokens.labelBase,
    ...grSwitchClassTokens.labelSizes,
])]
